#!/usr/bin/env python3
"""This script os based on an example script from the osxphotos website (https://rhettbull.github.io/osxphotos/API_README.html#additional-examples). It extracts data from the SQLite database of the Apple Photos app ('~/Pictures/Photos Library.photoslibrary/database') and creates a new database in the project directory's data folder.
"""

from __future__ import annotations

import json
import osxphotos
import click
from osxphotos.cli import query_command, verbose


# Helper function to extract object attributes recursively
def extract_object_data(obj):
    """Extract data from an object recursively."""
    # Special handling for PlaceInfo objects
    if obj.__class__.__name__ in ["PlaceInfo", "PlaceInfo5"]:
        # Extract all the PlaceInfo properties
        result = {}
        # Basic properties
        if hasattr(obj, "name"):
            result["name"] = obj.name
        if hasattr(obj, "country_code"):
            result["country_code"] = obj.country_code
        if hasattr(obj, "ishome"):
            result["ishome"] = obj.ishome
        if hasattr(obj, "address_str"):
            result["address_str"] = obj.address_str

        # Handle names property
        if hasattr(obj, "names"):
            names = {}
            names_obj = obj.names

            # Extract lists from names object
            for attr in dir(names_obj):
                if not attr.startswith("_") and not callable(getattr(names_obj, attr)):
                    value = getattr(names_obj, attr)
                    if isinstance(value, list) and value:
                        names[attr] = value

            result["names"] = names

        # Handle address property
        if hasattr(obj, "address"):
            address = {}
            addr_obj = obj.address

            # Extract all address attributes
            for attr in dir(addr_obj):
                if not attr.startswith("_") and not callable(getattr(addr_obj, attr)):
                    address[attr] = getattr(addr_obj, attr)

            result["address"] = address

        return result

    # Standard recursive extraction for other objects
    if hasattr(obj, "__dict__"):
        result = {}
        for k, v in obj.__dict__.items():
            if not k.startswith("_"):  # Skip private attributes
                if hasattr(v, "__dict__") or isinstance(v, (list, tuple, set)):
                    result[k] = extract_object_data(v)
                else:
                    result[k] = v
        return result
    elif isinstance(obj, (list, tuple, set)):
        return [
            extract_object_data(item) if hasattr(item, "__dict__") else item
            for item in obj
        ]
    else:
        return obj


# Custom JSON encoder to handle complex osxphotos objects
class PhotoEncoder(json.JSONEncoder):
    def default(self, obj):
        # Handle datetime objects
        if hasattr(obj, "isoformat"):
            return obj.isoformat()

        # Special handling for PlaceInfo objects
        if obj.__class__.__name__ in ["PlaceInfo", "PlaceInfo5"]:
            return extract_object_data(obj)

        # Handle complex objects with __dict__ (recursively extract data)
        if hasattr(obj, "__dict__"):
            return extract_object_data(obj)

        # Handle other special types
        try:
            return super().default(obj)
        except TypeError:
            # If all else fails, convert to string
            return str(obj)


@query_command
@click.option(
    "--exclude-unknown-persons",
    is_flag=True,
    help="Exclude persons with _UNKNOWN_ name",
)
@click.option(
    "--sqlite",
    type=click.Path(),
    help="Output to SQLite database at specified path",
)
def example(exclude_unknown_persons, sqlite, photos: list[osxphotos.PhotoInfo], **kwargs):
    """Sample query command for osxphotos. Prints out the filename and date (and all other specified keys) of each photo in JSON format.

    Whatever text you put in the function's docstring here, will be used as the command's
    help text when run via `osxphotos run get_all_data.py --help` or `python get_all_data.py --help`
    """

    verbose(f"Found {len(photos)} photo(s)")
    verbose("This message will only be printed if verbose level 2 is set", level=2)

    # Create a list to collect all photo data
    all_photos = []

    # Process each photo and add it to the list
    for photo in photos:
        # photos is a list of PhotoInfo objects
        # see: https://rhettbull.github.io/osxphotos/reference.html#osxphotos.PhotoInfo
        verbose(f"Processing {photo.original_filename}")

        # Filter out unknown persons if requested
        filtered_person_info = photo.person_info
        if exclude_unknown_persons:
            filtered_person_info = [p for p in filtered_person_info if p.name != "_UNKNOWN_"]
            # Also filter out faces that don't have a corresponding person
            if filtered_person_info:
                # Get UUIDs of known persons
                known_person_uuids = [p.uuid for p in filtered_person_info]
                # Only keep faces that belong to known persons
                # Note: Some faces might not have person_uuid attribute, so we need to check
                filtered_face_info = []
                for face in photo.face_info:
                    # Check if face belongs to a known person
                    if hasattr(face, 'person_uuid') and face.person_uuid in known_person_uuids:
                        filtered_face_info.append(face)
                    # If face has a name attribute that matches a known person, include it
                    elif hasattr(face, 'name') and any(p.name == face.name for p in filtered_person_info):
                        filtered_face_info.append(face)
            else:
                filtered_face_info = []
        else:
            filtered_face_info = photo.face_info

        # Create a dictionary with all the photo attributes
        photo_data = {
            "uuid": photo.uuid,
            "original_filename": photo.original_filename,
            "date": photo.date,
            "title": photo.title,
            "keywords": photo.keywords,
            "album_info": photo.album_info,
            "person_info": filtered_person_info,
            "face_info": filtered_face_info,
            "path": photo.path,
            "path_edited": photo.path_edited,
            "has_raw": photo.has_raw,
            "height": photo.height,
            "width": photo.width,
            "favorite": photo.favorite,
            "hidden": photo.hidden,
            "location": photo.location,
            "place": photo.place,
            "portrait": photo.portrait,
            "hdr": photo.hdr,
            "panorama": photo.panorama,
            "labels_normalized": photo.labels_normalized,
            "search_info": photo.search_info,
            "exif_info": photo.exif_info,
            "score": photo.score,
            "description": photo.description,
        }

        # Add this photo's data to our collection
        all_photos.append(photo_data)

    # If SQLite output is requested, create a database
    if sqlite:
        import sqlite3
        import os

        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(os.path.abspath(sqlite)), exist_ok=True)

        # Connect to database
        conn = sqlite3.connect(sqlite)
        cursor = conn.cursor()

        # Create tables with a normalized schema
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS photos (
            uuid TEXT PRIMARY KEY,
            original_filename TEXT,
            date TEXT,
            title TEXT,
            path TEXT,
            path_edited TEXT,
            has_raw INTEGER,
            height INTEGER,
            width INTEGER,
            favorite INTEGER,
            hidden INTEGER,
            latitude REAL,
            longitude REAL,
            portrait INTEGER,
            hdr INTEGER,
            panorama INTEGER,
            description TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS keywords (
            photo_uuid TEXT,
            keyword TEXT,
            PRIMARY KEY (photo_uuid, keyword),
            FOREIGN KEY (photo_uuid) REFERENCES photos(uuid)
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS albums (
            uuid TEXT PRIMARY KEY,
            title TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS photo_albums (
            photo_uuid TEXT,
            album_uuid TEXT,
            PRIMARY KEY (photo_uuid, album_uuid),
            FOREIGN KEY (photo_uuid) REFERENCES photos(uuid),
            FOREIGN KEY (album_uuid) REFERENCES albums(uuid)
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS persons (
            uuid TEXT PRIMARY KEY,
            name TEXT,
            display_name TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS photo_persons (
            photo_uuid TEXT,
            person_uuid TEXT,
            PRIMARY KEY (photo_uuid, person_uuid),
            FOREIGN KEY (photo_uuid) REFERENCES photos(uuid),
            FOREIGN KEY (person_uuid) REFERENCES persons(uuid)
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS faces (
            uuid TEXT PRIMARY KEY,
            photo_uuid TEXT,
            person_uuid TEXT,
            center_x REAL,
            center_y REAL,
            size REAL,
            quality REAL,
            source_width INTEGER,
            source_height INTEGER,
            has_smile INTEGER,
            manual INTEGER,
            face_type TEXT,
            age_type INTEGER,
            eye_makeup_type INTEGER,
            eye_state INTEGER,
            facial_hair_type INTEGER,
            gender_type INTEGER,
            glasses_type INTEGER,
            hair_color_type INTEGER,
            intrash INTEGER,
            lip_makeup_type INTEGER,
            smile_type INTEGER,
            FOREIGN KEY (photo_uuid) REFERENCES photos(uuid),
            FOREIGN KEY (person_uuid) REFERENCES persons(uuid)
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS labels (
            photo_uuid TEXT,
            label TEXT,
            PRIMARY KEY (photo_uuid, label),
            FOREIGN KEY (photo_uuid) REFERENCES photos(uuid)
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS places (
            photo_uuid TEXT PRIMARY KEY,
            name TEXT,
            country_code TEXT,
            address_str TEXT,
            FOREIGN KEY (photo_uuid) REFERENCES photos(uuid)
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS place_names (
            photo_uuid TEXT,
            name_type TEXT,
            name TEXT,
            PRIMARY KEY (photo_uuid, name_type, name),
            FOREIGN KEY (photo_uuid) REFERENCES photos(uuid)
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS place_addresses (
            photo_uuid TEXT PRIMARY KEY,
            street TEXT,
            city TEXT,
            state_province TEXT,
            postal_code TEXT,
            country TEXT,
            iso_country_code TEXT,
            FOREIGN KEY (photo_uuid) REFERENCES photos(uuid)
        )
        ''')

        # Create lookup tables for face attributes
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_gender_types (
            id INTEGER PRIMARY KEY,
            description TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_age_types (
            id INTEGER PRIMARY KEY,
            description TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_ethnicity_types (
            id INTEGER PRIMARY KEY,
            description TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_skin_tone_types (
            id INTEGER PRIMARY KEY,
            description TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_hair_color_types (
            id INTEGER PRIMARY KEY,
            description TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_facial_hair_types (
            id INTEGER PRIMARY KEY,
            description TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_mask_types (
            id INTEGER PRIMARY KEY,
            description TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_expression_types (
            id INTEGER PRIMARY KEY,
            description TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_pose_types (
            id INTEGER PRIMARY KEY,
            description TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_smile_types (
            id INTEGER PRIMARY KEY,
            description TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_smile_combined_types (
            has_smile INTEGER,
            smile_type INTEGER,
            description TEXT,
            PRIMARY KEY (has_smile, smile_type)
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_lip_makeup_types (
            id INTEGER PRIMARY KEY,
            description TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_eyes_state_types (
            id INTEGER PRIMARY KEY,
            description TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_eyes_closed_types (
            left_eye_closed INTEGER,
            right_eye_closed INTEGER,
            description TEXT,
            PRIMARY KEY (left_eye_closed, right_eye_closed)
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_glasses_types (
            id INTEGER PRIMARY KEY,
            description TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_eye_makeup_types (
            id INTEGER PRIMARY KEY,
            description TEXT
        )
        ''')

        # Insert lookup data
        # Gender types
        cursor.execute('INSERT OR IGNORE INTO face_gender_types VALUES (0, "unknown")')
        cursor.execute('INSERT OR IGNORE INTO face_gender_types VALUES (1, "Male")')
        cursor.execute('INSERT OR IGNORE INTO face_gender_types VALUES (2, "Female")')

        # Age types
        cursor.execute('INSERT OR IGNORE INTO face_age_types VALUES (0, "unknown")')
        cursor.execute('INSERT OR IGNORE INTO face_age_types VALUES (1, "Infant/Toddler")')
        cursor.execute('INSERT OR IGNORE INTO face_age_types VALUES (2, "Toddler/Child")')
        cursor.execute('INSERT OR IGNORE INTO face_age_types VALUES (3, "Child/Young Adult")')
        cursor.execute('INSERT OR IGNORE INTO face_age_types VALUES (4, "Young Adult/Adult")')
        cursor.execute('INSERT OR IGNORE INTO face_age_types VALUES (5, "Adult")')

        # Ethnicity types
        cursor.execute('INSERT OR IGNORE INTO face_ethnicity_types VALUES (0, "other/unknown")')
        cursor.execute('INSERT OR IGNORE INTO face_ethnicity_types VALUES (1, "Black")')
        cursor.execute('INSERT OR IGNORE INTO face_ethnicity_types VALUES (2, "White")')
        cursor.execute('INSERT OR IGNORE INTO face_ethnicity_types VALUES (3, "Hispanic/Latino")')
        cursor.execute('INSERT OR IGNORE INTO face_ethnicity_types VALUES (4, "Asian")')
        cursor.execute('INSERT OR IGNORE INTO face_ethnicity_types VALUES (5, "Pacific Islander")')

        # Skin tone types
        cursor.execute('INSERT OR IGNORE INTO face_skin_tone_types VALUES (0, "other/unknown")')
        cursor.execute('INSERT OR IGNORE INTO face_skin_tone_types VALUES (1, "Light to Pale White")')
        cursor.execute('INSERT OR IGNORE INTO face_skin_tone_types VALUES (2, "White to Fair")')
        cursor.execute('INSERT OR IGNORE INTO face_skin_tone_types VALUES (3, "Fair to Olive")')
        cursor.execute('INSERT OR IGNORE INTO face_skin_tone_types VALUES (4, "Olive to Moderate Brown")')
        cursor.execute('INSERT OR IGNORE INTO face_skin_tone_types VALUES (5, "Brown to Dark Brown")')
        cursor.execute('INSERT OR IGNORE INTO face_skin_tone_types VALUES (6, "Very Dark Brown to Black")')

        # Hair color types
        cursor.execute('INSERT OR IGNORE INTO face_hair_color_types VALUES (0, "other/unknown")')
        cursor.execute('INSERT OR IGNORE INTO face_hair_color_types VALUES (1, "Black/Brown")')
        cursor.execute('INSERT OR IGNORE INTO face_hair_color_types VALUES (2, "Brown/Blonde")')
        cursor.execute('INSERT OR IGNORE INTO face_hair_color_types VALUES (3, "Brown/Red")')
        cursor.execute('INSERT OR IGNORE INTO face_hair_color_types VALUES (4, "Red/White")')
        cursor.execute('INSERT OR IGNORE INTO face_hair_color_types VALUES (5, "Artifical")')
        cursor.execute('INSERT OR IGNORE INTO face_hair_color_types VALUES (6, "White/Bald")')

        # Facial hair types
        cursor.execute('INSERT OR IGNORE INTO face_facial_hair_types VALUES (0, "other/unknown")')
        cursor.execute('INSERT OR IGNORE INTO face_facial_hair_types VALUES (1, "Clean Shaven")')
        cursor.execute('INSERT OR IGNORE INTO face_facial_hair_types VALUES (2, "Beard")')
        cursor.execute('INSERT OR IGNORE INTO face_facial_hair_types VALUES (3, "Goatee")')
        cursor.execute('INSERT OR IGNORE INTO face_facial_hair_types VALUES (4, "Mustache")')
        cursor.execute('INSERT OR IGNORE INTO face_facial_hair_types VALUES (5, "Stubble")')

        # Face mask types
        cursor.execute('INSERT OR IGNORE INTO face_mask_types VALUES (0, "Not Wearing Mask")')
        cursor.execute('INSERT OR IGNORE INTO face_mask_types VALUES (1, "Wearing Mask")')

        # Face expression types
        cursor.execute('INSERT OR IGNORE INTO face_expression_types VALUES (0, "NA")')
        cursor.execute('INSERT OR IGNORE INTO face_expression_types VALUES (1, "Disgusted/Angry")')
        cursor.execute('INSERT OR IGNORE INTO face_expression_types VALUES (2, "Surprised/Fearful")')
        cursor.execute('INSERT OR IGNORE INTO face_expression_types VALUES (3, "Neutral")')
        cursor.execute('INSERT OR IGNORE INTO face_expression_types VALUES (4, "Confident/Smirk")')
        cursor.execute('INSERT OR IGNORE INTO face_expression_types VALUES (5, "Happiness")')
        cursor.execute('INSERT OR IGNORE INTO face_expression_types VALUES (6, "Sadness")')

        # Pose types
        cursor.execute('INSERT OR IGNORE INTO face_pose_types VALUES (0, "other/unknown - 0")')
        cursor.execute('INSERT OR IGNORE INTO face_pose_types VALUES (1, "Face Frontal Pose")')
        cursor.execute('INSERT OR IGNORE INTO face_pose_types VALUES (2, "other/unknown - 2")')
        cursor.execute('INSERT OR IGNORE INTO face_pose_types VALUES (3, "Face Profile Pose")')
        cursor.execute('INSERT OR IGNORE INTO face_pose_types VALUES (4, "other/unknown - 4")')
        cursor.execute('INSERT OR IGNORE INTO face_pose_types VALUES (5, "other/unknown - 5")')

        # Smile types
        cursor.execute('INSERT OR IGNORE INTO face_smile_types VALUES (0, "other/unknown")')
        cursor.execute('INSERT OR IGNORE INTO face_smile_types VALUES (1, "Not Showing Teeth")')
        cursor.execute('INSERT OR IGNORE INTO face_smile_types VALUES (2, "Showing Teeth")')

        # Combined smile types
        cursor.execute('INSERT OR IGNORE INTO face_smile_combined_types VALUES (0, 0, "Not Smiling")')
        cursor.execute('INSERT OR IGNORE INTO face_smile_combined_types VALUES (1, 1, "Smiling without Teeth")')
        cursor.execute('INSERT OR IGNORE INTO face_smile_combined_types VALUES (1, 2, "Smiling with Teeth")')

        # Lip makeup types
        cursor.execute('INSERT OR IGNORE INTO face_lip_makeup_types VALUES (0, "Not Wearing Lip Makeup")')
        cursor.execute('INSERT OR IGNORE INTO face_lip_makeup_types VALUES (1, "Wearing Lip Makeup")')

        # Eyes state types
        cursor.execute('INSERT OR IGNORE INTO face_eyes_state_types VALUES (0, "other/unknown")')
        cursor.execute('INSERT OR IGNORE INTO face_eyes_state_types VALUES (1, "Eyes Closed")')
        cursor.execute('INSERT OR IGNORE INTO face_eyes_state_types VALUES (2, "Eyes Open")')

        # Combined eyes closed types
        cursor.execute('INSERT OR IGNORE INTO face_eyes_closed_types VALUES (1, 1, "Both Eyes Closed")')
        cursor.execute('INSERT OR IGNORE INTO face_eyes_closed_types VALUES (0, 0, "Both Eyes Open")')
        cursor.execute('INSERT OR IGNORE INTO face_eyes_closed_types VALUES (1, 0, "Winking")')
        cursor.execute('INSERT OR IGNORE INTO face_eyes_closed_types VALUES (0, 1, "Winking")')

        # Glasses types
        cursor.execute('INSERT OR IGNORE INTO face_glasses_types VALUES (1, "Eye Glasses")')
        cursor.execute('INSERT OR IGNORE INTO face_glasses_types VALUES (2, "Sun Glasses")')
        cursor.execute('INSERT OR IGNORE INTO face_glasses_types VALUES (3, "No Glasses")')

        # Eye makeup types
        cursor.execute('INSERT OR IGNORE INTO face_eye_makeup_types VALUES (0, "Not Wearing Eye Makeup")')
        cursor.execute('INSERT OR IGNORE INTO face_eye_makeup_types VALUES (1, "Wearing Eye Makeup")')

        SOURCE_PREFIX = "/Volumes/Samsung/Pictures/Photos Library.photoslibrary/"
        WEB_PREFIX = "images/Photos Library.photoslibrary/"

        def normalize_path(abs_path):
            if abs_path and abs_path.startswith(SOURCE_PREFIX):
                return abs_path.replace(SOURCE_PREFIX, WEB_PREFIX)
            return abs_path

        # Insert data into tables
        for photo_data in all_photos:
            # Normalize paths before inserting into the database
            normalized_path = normalize_path(photo_data["path"])
            normalized_path_edited = normalize_path(photo_data["path_edited"])

            # Insert into photos table
            location = photo_data["location"]
            cursor.execute('''
            INSERT OR REPLACE INTO photos VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                photo_data["uuid"],
                photo_data["original_filename"],
                photo_data["date"].isoformat() if photo_data["date"] else None,
                photo_data["title"],
                normalized_path,  # Overwrite with normalized path
                normalized_path_edited,  # Overwrite with normalized path_edited
                1 if photo_data["has_raw"] else 0,
                photo_data["height"],
                photo_data["width"],
                1 if photo_data["favorite"] else 0,
                1 if photo_data["hidden"] else 0,
                location[0] if location != (None, None) else None,
                location[1] if location != (None, None) else None,
                1 if photo_data["portrait"] else 0,
                1 if photo_data["hdr"] else 0,
                1 if photo_data["panorama"] else 0,
                photo_data["description"]
            ))

            # Insert keywords
            for keyword in photo_data["keywords"]:
                cursor.execute('''
                INSERT OR IGNORE INTO keywords VALUES (?, ?)
                ''', (photo_data["uuid"], keyword))

            # Insert albums
            for album in photo_data["album_info"]:
                cursor.execute('''
                INSERT OR IGNORE INTO albums VALUES (?, ?)
                ''', (album.uuid, album.title))

                cursor.execute('''
                INSERT OR IGNORE INTO photo_albums VALUES (?, ?)
                ''', (photo_data["uuid"], album.uuid))

            # Insert persons and photo_persons
            for person in photo_data["person_info"]:
                cursor.execute('''
                INSERT OR IGNORE INTO persons VALUES (?, ?, ?)
                ''', (person.uuid, person.name, person.display_name))

                cursor.execute('''
                INSERT OR IGNORE INTO photo_persons VALUES (?, ?)
                ''', (photo_data["uuid"], person.uuid))

            # Insert faces
            for face in photo_data["face_info"]:
                person_uuid = None
                # Try to find the person UUID for this face
                for person in photo_data["person_info"]:
                    if hasattr(face, 'person_uuid') and face.person_uuid == person.uuid:
                        person_uuid = person.uuid
                        break

                cursor.execute('''
                INSERT OR IGNORE INTO faces VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    face.uuid,
                    photo_data["uuid"],
                    person_uuid,
                    face.center_x if hasattr(face, 'center_x') else None,
                    face.center_y if hasattr(face, 'center_y') else None,
                    face.size if hasattr(face, 'size') else None,
                    face.quality if hasattr(face, 'quality') else None,
                    face.source_width if hasattr(face, 'source_width') else None,
                    face.source_height if hasattr(face, 'source_height') else None,
                    face.has_smile if hasattr(face, 'has_smile') else None,
                    face.manual if hasattr(face, 'manual') else None,
                    face.face_type if hasattr(face, 'face_type') else None,
                    face.age_type if hasattr(face, 'age_type') else None,
                    face.eye_makeup_type if hasattr(face, 'eye_makeup_type') else None,
                    face.eye_state if hasattr(face, 'eye_state') else None,
                    face.facial_hair_type if hasattr(face, 'facial_hair_type') else None,
                    face.gender_type if hasattr(face, 'gender_type') else None,
                    face.glasses_type if hasattr(face, 'glasses_type') else None,
                    face.hair_color_type if hasattr(face, 'hair_color_type') else None,
                    face.intrash if hasattr(face, 'intrash') else None,
                    face.lip_makeup_type if hasattr(face, 'lip_makeup_type') else None,
                    face.smile_type if hasattr(face, 'smile_type') else None
                ))

            # Insert labels
            for label in photo_data["labels_normalized"]:
                cursor.execute('''
                INSERT OR IGNORE INTO labels VALUES (?, ?)
                ''', (photo_data["uuid"], label))

            # Insert place data if available
            place = photo_data["place"]
            if place is not None:
                # Convert place to dict if it's not already
                place_dict = place
                if not isinstance(place, dict):
                    # Try to extract data from the PlaceInfo object
                    place_dict = {}
                    if hasattr(place, 'name'):
                        place_dict["name"] = place.name
                    if hasattr(place, 'country_code'):
                        place_dict["country_code"] = place.country_code
                    if hasattr(place, 'address_str'):
                        place_dict["address_str"] = place.address_str

                # Only proceed if we have a non-empty dictionary
                if isinstance(place_dict, dict) and place_dict:
                    cursor.execute('''
                    INSERT OR IGNORE INTO places VALUES (?, ?, ?, ?)
                    ''', (
                        photo_data["uuid"],
                        place_dict.get("name"),
                        place_dict.get("country_code"),
                        place_dict.get("address_str")
                    ))

                    # Insert place names
                    if "names" in place_dict and place_dict["names"]:
                        for name_type, names in place_dict["names"].items():
                            if isinstance(names, list):
                                for name in names:
                                    cursor.execute('''
                                    INSERT OR IGNORE INTO place_names VALUES (?, ?, ?)
                                    ''', (photo_data["uuid"], name_type, name))
                    elif hasattr(place, 'names') and place.names:
                        # Handle names from PlaceInfo object
                        names_obj = place.names
                        for attr in dir(names_obj):
                            if not attr.startswith("_") and not callable(getattr(names_obj, attr)):
                                value = getattr(names_obj, attr)
                                if isinstance(value, list) and value:
                                    for name in value:
                                        cursor.execute('''
                                        INSERT OR IGNORE INTO place_names VALUES (?, ?, ?)
                                        ''', (photo_data["uuid"], attr, name))

                    # Insert place address
                    if "address" in place_dict and place_dict["address"]:
                        address = place_dict["address"]
                        cursor.execute('''
                        INSERT OR IGNORE INTO place_addresses VALUES (?, ?, ?, ?, ?, ?, ?)
                        ''', (
                            photo_data["uuid"],
                            address.get("street"),
                            address.get("city"),
                            address.get("state_province"),
                            address.get("postal_code"),
                            address.get("country"),
                            address.get("iso_country_code")
                        ))
                    elif hasattr(place, 'address') and place.address:
                        # Handle address from PlaceInfo object
                        addr_obj = place.address
                        cursor.execute('''
                        INSERT OR IGNORE INTO place_addresses VALUES (?, ?, ?, ?, ?, ?, ?)
                        ''', (
                            photo_data["uuid"],
                            getattr(addr_obj, 'street', None),
                            getattr(addr_obj, 'city', None),
                            getattr(addr_obj, 'state_province', None),
                            getattr(addr_obj, 'postal_code', None),
                            getattr(addr_obj, 'country', None),
                            getattr(addr_obj, 'iso_country_code', None)
                        ))

        # Commit changes and close connection
        conn.commit()
        conn.close()
        print(f"Data exported to SQLite database: {sqlite}")
    else:
        # Output the entire array as JSON using our custom encoder
        print(json.dumps(all_photos, cls=PhotoEncoder, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    # call your function here
    # you do not need to pass any arguments to the function
    # as the decorator will handle parsing the command line arguments
    example()
