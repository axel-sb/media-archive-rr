import { render } from '@testing-library/react'
import { default as Home, loader, meta } from './home'

describe('meta Test suite', () => {
	it('should work', () => {
		expect(
			meta({
				params: {},
				data: {},
				location: { ...new Location(), state: {}, key: '' },
				matches: [],
			}),
		).toBeTruthy()
	})
})

describe('loader Test suite', () => {
	it('should work', async () => {
		const request = new Request('http://localhost:3000/')
		const response = await loader({
			request,
			params: {},
			context: {},
		})

		expect(response).toBeInstanceOf(Response)
	})
})

describe('Home Test suite', () => {
	it('should work', async () => {
		render(<Home />)
		expect(Home).toBeTruthy()
	})
})
