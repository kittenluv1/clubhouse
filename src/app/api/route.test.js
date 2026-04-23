/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

const mockSupabase = {
	from: jest.fn().mockReturnThis(),
	update: jest.fn().mockReturnThis(),
	insert: jest.fn().mockReturnThis(),
	eq: jest.fn().mockReturnThis(),
	select: jest.fn().mockResolvedValue({ count: 1, error: null }),
}

jest.mock('../lib/server-db.js', () => ({
	supabaseServer: mockSupabase
}));

const mockOrgList = [
	{
		OrganizationID: 5731,
		OrganizationName: 'Creative Labs UCLA',
		AdvisorName: 'MIRANDA REDMAN',
		OrganizationEmail: 'uclacreatives@gmail.com',
		OrganizationWebSite: 'https://www.creativelabsucla.com/',
		Category1Name: 'Technology',
		Category2Name: 'Academic',
		MemberType: 'Undergraduate',
		SocialMediaLink: "<a target='_blank' href='https://www.instagram.com/creativelabsucla/'>Instagram</a> , <a target='_blank' href='https://www.linkedin.com/company/creativelabs-la/people/'>Linkedin</a>"
	},
	{
		OrganizationID: 6895,
		OrganizationName: 'Longevity Club at UCLA',
		AdvisorName: 'ORLANDO LUNA',
		OrganizationEmail: 'uclalongevity@outlook.com',
		OrganizationWebSite: '',
		Category1Name: 'Health and Wellness',
		Category2Name: 'Engineering',
		MemberType: 'Graduate/Undergraduate',
		SocialMediaLink: "<a target='_blank' href='https://www.instagram.com/uclalongevity'>Instagram</a>"
	},
];

const mockClubSportsOrgList = [
	{
		OrganizationID: 'V3Q2-L6L95',
		OrganizationName: 'Archery',
		OrganizationDescription: 'UCLA Archery is a beginner-friendly club open to all experience levels. We have a flexible practice schedule, allowing archers to dictate how much time and focus they dedicate to shooting. Our instructors will teach you everything you need to know and there are always experienced archers around to answer any questions or give you a helping hand. We attend tournaments in California as well as other states. All tournaments are open to everyone, regardless of skill level, but competing is a completely optional part of our club. For more information, feel free to check us out at the links below!',
		OrganizationEmail: 'uclaclubarchery@gmail.com',
		OrganizationWebSite: 'https://uclaclubsports.com/sports/archery',
		Category1Name: 'Club Sports',
		Category2Name: 'Archery',
		SocialMediaLink: 'https://www.facebook.com/UCLAClubArchery/'
	},
];

function mockSuccessFetches() {
	fetch
		.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ orgList: mockOrgList }),
		})
		.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ clubSportsOrgList: mockClubSportsOrgList }),
		});
}

describe('clubs API route: test fake fetch and update Supabase', () => {
	const CREATIVE_LABS_ORG_ID = 5731;

	beforeEach(() => {
		jest.clearAllMocks();
		global.fetch = jest.fn();
	});

	test('return 200 and club data on success', async () => {
		mockSuccessFetches();
		const { GET } = await import('./route');
		const response = await GET(new NextRequest('http://localhost/api', { method: 'PATCH' }));
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toHaveProperty('clubs');
	});

	test('return 500 if fetch fails', async () => {
		jest.spyOn(console, 'error').mockImplementation(() => {});
		fetch.mockResolvedValueOnce({ ok: false, status: 500 });
		const { GET } = await import('./route');
		const response = await GET(new NextRequest('http://localhost/api', { method: 'PATCH' }));
		expect(response.status).toBe(500);
	});

	test("don't include null club descriptions in update calls", async () => {
		mockSuccessFetches();
		const { GET } = await import('./route');
		await GET(new NextRequest('http://localhost/api'));

		// get all calls made to update()
		const updateCalls = mockSupabase.update.mock.calls;

		// check none of them included description: null
		for (const [payload] of updateCalls) {
			expect(payload).not.toHaveProperty('description', null);
		}
	});
});
