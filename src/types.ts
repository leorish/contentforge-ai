/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'Owner' | 'Admin' | 'Editor' | 'Writer';
  creditsLimit: number;
  creditsUsed: number;
  subscriptionPlan: 'Free' | 'Pro' | 'Business';
  createdAt: string;
}

export interface BrandProfile {
  id: string;
  name: string;
  industry: string;
  targetAudience: string;
  tone: 'Professional' | 'Corporate' | 'Gen Z' | 'Startup' | 'Luxury' | 'Educational';
  writingStyle: string;
  keywords: string[];
}

export interface GeneratedAsset {
  type: string; // 'linkedin' | 'instagram' | 'twitter' | 'facebook' | 'youtube_desc' | 'youtube_script' | 'blog_outline' | 'blog_article' | 'marketing' | 'email' | 'video'
  content: string;
}

export interface ContentProject {
  id: string;
  title: string;
  topic: string;
  brandVoiceId?: string;
  generatedAt: string;
  content: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube_desc?: string;
    youtube_script?: string;
    blog_outline?: string;
    blog_article?: string;
    marketing?: string;
    hashtags?: string[];
    seoMeta?: {
      title: string;
      description: string;
      score: number;
      suggestions: string[];
      internalLinks: string[];
      faqs: { q: string; a: string }[];
      cta: string;
    };
  };
}

export interface ScheduledPost {
  id: string;
  content: string;
  platforms: ('LinkedIn' | 'Facebook' | 'Instagram' | 'X/Twitter')[];
  scheduledTime: string;
  status: 'Draft' | 'Scheduled' | 'Published' | 'Failed';
  approvalStatus: 'Pending' | 'Approved' | 'Declined';
  title: string;
  mediaUrl?: string;
}

export interface CalendarItem {
  id: string;
  topic: string;
  platform: 'LinkedIn' | 'Instagram' | 'Facebook' | 'X/Twitter' | 'YouTube' | 'Email';
  postingTime: string;
  goal: string;
  cta: string;
  date: string; // YYYY-MM-DD
}

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Editor' | 'Writer';
  status: 'Active' | 'Invited';
}

export interface Comment {
  id: string;
  postId?: string;
  projectId?: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totals: {
    views: number;
    clicks: number;
    engagement: number;
    ctr: number;
    shares: number;
    growth: number;
  };
  daily: { date: string; views: number; clicks: number; engagement: number }[];
  weekly: { week: string; views: number; clicks: number; engagement: number }[];
  monthly: { month: string; views: number; clicks: number; engagement: number }[];
}

export interface AIUsageStats {
  totalRequests: number;
  byType: {
    blog: number;
    social: number;
    hashtags: number;
    video: number;
    repurpose: number;
    email: number;
    calendar: number;
  };
  creditsHistory: { date: string; used: number }[];
}
