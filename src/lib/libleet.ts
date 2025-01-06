import { z } from 'zod';

// Define Zod schemas for input parameters
const UsernameSchema = z.string().min(1, "Username is required");
const TitleSlugSchema = z.string().min(1, "TitleSlug is required");
const TopicIdSchema = z.string().min(1, "TopicId is required");
const LimitSchema = z.number().int().positive();
const TagsSchema = z.string().array();
const YearSchema = z.number().int().positive();

// Define Zod schemas for responses (example)
const UserDetailsResponseSchema = z.object({
    username: z.string(),
    // Add other fields as needed
});

const SubmissionResponseSchema = z.object({
    // Define the expected structure of the submission response
    id: z.number(),
    title: z.string(),
    // Add other fields as needed
});

// API Client Functions

// User Details Endpoints
export async function getUserDetails(username: string) {
    UsernameSchema.parse(username); // Validate input
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}`);
    const data = await response.json();
    return UserDetailsResponseSchema.parse(data); // Validate response
}

async function getUserBadges(username: string) {
    UsernameSchema.parse(username);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/badges`);
    const data = await response.json();
    return z.array(z.object({ /* Define badge schema */ })).parse(data);
}

async function getUserSolved(username: string) {
    UsernameSchema.parse(username);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`);
    const data = await response.json();
    return z.number().parse(data);
}

async function getUserContest(username: string) {
    UsernameSchema.parse(username);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/contest`);
    const data = await response.json();
    return z.object({ /* Define contest details schema */ }).parse(data);
}

async function getUserContestHistory(username: string) {
    UsernameSchema.parse(username);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/contest/history`);
    const data = await response.json();
    return z.array(z.object({ /* Define contest history schema */ })).parse(data);
}

async function getUserSubmission(username: string) {
    UsernameSchema.parse(username);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/submission`);
    const data = await response.json();
    return z.array(SubmissionResponseSchema).parse(data);
}

export async function getUserAcSubmission(username: string) {
    UsernameSchema.parse(username);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/acSubmission`);
    const data = await response.json();
    return z.array(SubmissionResponseSchema).parse(data);
}

async function getUserCalendar(username: string) {
    UsernameSchema.parse(username);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/calendar`);
    const data = await response.json();
    return z.object({ /* Define calendar schema */ }).parse(data);
}

async function getUserProfile(username: string) {
    UsernameSchema.parse(username);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${username}`);
    const data = await response.json();
    return z.object({ /* Define full profile schema */ }).parse(data);
}

async function getUserProfileCalendar(username: string, year: number) {
    UsernameSchema.parse(username);
    YearSchema.parse(year);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/userProfileCalendar?username=${username}&year=${year}`);
    const data = await response.json();
    return z.object({ /* Define calendar details schema */ }).parse(data);
}

async function getLanguageStats(username: string) {
    UsernameSchema.parse(username);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/languageStats?username=${username}`);
    const data = await response.json();
    return z.object({ /* Define language stats schema */ }).parse(data);
}

async function getUserQuestionProgressV2(userSlug: string) {
    UsernameSchema.parse(userSlug);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/userProfileUserQuestionProgressV2/${userSlug}`);
    const data = await response.json();
    return z.object({ /* Define question progress schema */ }).parse(data);
}

async function getSkillStats(username: string) {
    UsernameSchema.parse(username);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/skillStats/${username}`);
    const data = await response.json();
    return z.object({ /* Define skill stats schema */ }).parse(data);
}

// Contest Endpoints
async function getUserContestRankingInfo(username: string) {
    UsernameSchema.parse(username);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/userContestRankingInfo/${username}`);
    const data = await response.json();
    return z.object({ /* Define contest ranking info schema */ }).parse(data);
}

// Discussion Endpoints
async function getTrendingDiscuss(first: number) {
    LimitSchema.parse(first);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/trendingDiscuss?first=${first}`);
    const data = await response.json();
    return z.array(z.object({ /* Define discussion schema */ })).parse(data);
}

async function getDiscussTopic(topicId: string) {
    TopicIdSchema.parse(topicId);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/discussTopic/${topicId}`);
    const data = await response.json();
    return z.object({ /* Define topic schema */ }).parse(data);
}

async function getDiscussComments(topicId: string) {
    TopicIdSchema.parse(topicId);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/discussComments/${topicId}`);
    const data = await response.json();
    return z.array(z.object({ /* Define comments schema */ })).parse(data);
}

// Problems Endpoints
async function getSelectedProblem(titleSlug: string) {
    TitleSlugSchema.parse(titleSlug);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/select?titleSlug=${titleSlug}`);
    const data = await response.json();
    return z.object({ /* Define problem schema */ }).parse(data);
}

async function getDailyProblem() {
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/daily`);
    const data = await response.json();
    return z.object({ /* Define daily problem schema */ }).parse(data);
}

async function getDailyQuestion() {
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/dailyQuestion`);
    const data = await response.json();
    return z.object({ /* Define daily question schema */ }).parse(data);
}

async function getProblems(limit?: number, tags?: string[]) {
    if (limit) LimitSchema.parse(limit);
    if (tags) TagsSchema.parse(tags);
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    if (tags) queryParams.append('tags', tags.join('+'));
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/problems?${queryParams.toString()}`);
    const data = await response.json();
    return z.array(z.object({ /* Define problems schema */ })).parse(data);
}

async function getOfficialSolution(titleSlug: string) {
    TitleSlugSchema.parse(titleSlug);
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/officialSolution?titleSlug=${titleSlug}`);
    const data = await response.json();
    return z.object({ /* Define official solution schema */ }).parse(data);
}

// Example usage
(async () => {
    try {
        const userDetails = await getUserDetails('exampleUser');
        console.log(userDetails);

        const acSubmissions = await getUserAcSubmission('exampleUser');
        console.log(acSubmissions);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
})();
