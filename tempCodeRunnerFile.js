let paths = [
'/Volumes/Crucial/Takeout-Photos_50G_2025-02-25/Google-Photos/Photos from 2022/IMG_3161.HEIC',
'/Volumes/Crucial/Takeout-Photos_50G_2025-02-25/Google-Photos/Photos from 2022/IMG_3162.HEIC',
'/Volumes/Crucial/Takeout-Photos_50G_2025-02-25/Google-Photos/Photos from 2022/IMG_3163.HEIC',
'/Volumes/Crucial/Takeout-Photos_50G_2025-02-25/Google-Photos/Photos from 2022/IMG_3164.HEIC',
'/Volumes/Crucial/Takeout-Photos_50G_2025-02-25/Google-Photos/Photos from 2022/IMG_3165.HEIC',
'/Volumes/Crucial/Takeout-Photos_50G_2025-02-25/Google-Photos/Photos from 2022/IMG_3173.HEIC',
'/Volumes/Crucial/Takeout-Photos_50G_2025-02-25/Google-Photos/Photos from 2022/IMG_3174.HEIC',
'/Volumes/Crucial/Takeout-Photos_50G_2025-02-25/Google-Photos/Photos from 2022/IMG_3187.HEIC',
'/Volumes/Crucial/Takeout-Photos_50G_2025-02-25/Google-Photos/Photos from 2022/IMG_3188.HEIC',
'/Volumes/Crucial/Takeout-Photos_50G_2025-02-25/Google-Photos/Photos from 2022/IMG_3189.HEIC',
'/Volumes/Crucial/Takeout-Photos_50G_2025-02-25/Google-Photos/Photos from 2022/IMG_3190.HEIC',
'/Volumes/Crucial/Takeout-Photos_50G_2025-02-25/Google-Photos/Photos from 2022/IMG_3191.HEIC',
'/Volumes/Crucial/Takeout-Photos_50G_2025-02-25/Google-Photos/Photos from 2022/IMG_3192.HEIC',
'/Volumes/Crucial/Takeout-Photos_50G_2025-02-25/Google-Photos/Photos from 2022/IMG_3202.HEIC',
]

let prompts = []



  for (let path of paths) {
let prompt = `llm 'Please describe this image. If the image is severely blurred, underexposed or appears to be taken by accidentally pressing the camera button, please merely reply with: "Scrap."' \
  -a  ${path} \
  -m gemini-2.0-flash`
  console.log("🟡 prompt", prompt)