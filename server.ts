/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ---------------------------------------------------------
// Secure Gemini API Service Layer with Safe Lazy Initialization
// ---------------------------------------------------------
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      try {
        geminiClient = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI client:", err);
      }
    }
  }
  return geminiClient;
}

// ---------------------------------------------------------
// Live State Mock-Database Store (Simulating MySQL Data structures)
// ---------------------------------------------------------
let currentSubscription: "Free" | "Pro" | "Business" = "Pro";
let apiCreditsUsed = 12;
const apiCreditsLimit = 100;

let brandProfiles = [
  {
    id: "brand-1",
    name: "TechSphere Consulting",
    industry: "B2B Software & Professional Services",
    targetAudience: "Startups, SaaS Founders, and Enterprise Tech Leaders",
    tone: "Startup",
    writingStyle: "Punchy, authoritative, highly narrative, with clear action bullets. No emojis in blogs, moderate usage in social posts.",
    keywords: ["B2B SaaS", "Cloud Migration", "Productivity", "Scaling Strategies"],
  },
  {
    id: "brand-2",
    name: "Vogue & Velvet",
    industry: "Luxury Fashion & Lifestyle Accessories",
    targetAudience: "Gen Z & Millennial Luxury Shoppers, Fashion Enthusiasts",
    tone: "Luxury",
    writingStyle: "Sleek, evocative, minimalistic yet sophisticated, deeply immersive adjectives, formatting with airy spaces.",
    keywords: ["Quiet Luxury", "Slow Fashion", "Artisanal", "Bespoke Styles"],
  }
];

let teamMembers = [
  { id: "tm-1", fullName: "Rishabh Gupta", email: "rishabhgupta.ffm@gmail.com", role: "Owner", status: "Active" },
  { id: "tm-2", fullName: "Sarah Connor", email: "sarah@contentforge.ai", role: "Admin", status: "Active" },
  { id: "tm-3", fullName: "Kenji Sato", email: "kenji@contentforge.ai", role: "Editor", status: "Active" },
  { id: "tm-4", fullName: "David Miller", email: "david@contentforge.ai", role: "Writer", status: "Invited" }
];

let comments = [
  { id: "c-1", postId: "post-1", authorName: "Sarah Connor", authorRole: "Admin", text: "Let's increase the SEO scoring on this draft. Can we insert more SaaS keywords?", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "c-2", postId: "post-1", authorName: "Kenji Sato", authorRole: "Editor", text: "Approved the graphics look. Once text is optimized, it is ready to schedule.", createdAt: new Date(Date.now() - 1800000).toISOString() }
];

let scheduledPosts = [
  {
    id: "post-1",
    title: "10 Commandments of Cloud Migration",
    content: "🚀 Cloud transitions can sink SaaS startups or skyrocket their margin efficiency. The difference is alignment on Day -1.\n\nHere are 3 fatal migration traps you must dodge:\n1. Lifting and shifting without refactoring legacy data paths\n2. Ignoring serverless auto-scaling latency spikes\n3. Over-provisioning static SQL resource units\n\nRead our raw tech playbook at contentforge.ai/blog/migration",
    platforms: ["LinkedIn", "X/Twitter"],
    scheduledTime: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    status: "Scheduled",
    approvalStatus: "Approved",
    mediaUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "post-2",
    title: "Quiet Luxury Trend - Visual Manifesto",
    content: "Whispered detailing over loud logomania. The Velvet capsule features single-origin cashmere structured to withstand the fleeting seasons. Crafted for individuals who appreciate the silence. ✨ Discover our selection.",
    platforms: ["Instagram", "Facebook"],
    scheduledTime: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
    status: "Draft",
    approvalStatus: "Pending",
    mediaUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop"
  }
];

let calendarItems = [
  {
    id: "cal-1",
    topic: "Vulnerability in Modern SaaS Management",
    platform: "LinkedIn",
    postingTime: "09:00 AM",
    goal: "SaaS brand credibility booster",
    cta: "Link to case study",
    date: new Date(Date.now()).toISOString().split('T')[0] // today
  },
  {
    id: "cal-2",
    topic: "Behind the Scenes of Runway Capsule Design",
    platform: "Instagram",
    postingTime: "04:30 PM",
    goal: "Brand loyalty and luxury affinity",
    cta: "Shop the capsule list",
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0] // tomorrow
  },
  {
    id: "cal-3",
    topic: "Why relational schemas outperform NoSQL for financial metrics",
    platform: "X/Twitter",
    postingTime: "11:15 AM",
    goal: "Developer authority positioning",
    cta: "None",
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  }
];

let contentProjects = [
  {
    id: "proj-1",
    title: "Django Learning Roadmap",
    topic: "Django Learning",
    brandVoiceId: "brand-1",
    generatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    content: {
      linkedin: "🔥 Thinking about diving into backends? Django remains the absolute powerhouse for building secure, scalable apps at speed.\n\nHere's why Python's largest framework is a default choice for fast-moving teams:\n\n1. Batteries-Included Philosophy: ORM, Auth, Router, and Admin console are ready straight out of the box.\n2. Security-First Architecture: Auto-prevents SQL injections, CSRF attacks, and XSS exploits without extra logic.\n3. Scalability with Ease: Powering titans like Instagram, Disqus, and Bitbucket.\n\nReady to elevate your engineering skills? Tap in and let us know your favorite Django feature below!",
      twitter: "1/ Looking to master full-stack scaling? Python's Django is an absolute titan. Here's your definitive 2026 learning blueprint. 👇\n\n2/ Week 1: Fundamental MVC/MVT.\nFocus strictly on understanding Models, Views, Templates, and Routing. Do not skip understanding how the Django ORM queries objects cleanly.\n\n3/ Week 2: Build Real-World REST APIs.\nAdd Django REST Framework (DRF). Learn Serializers, ViewSets, and custom JWT authentication guards.\n\n4/ Week 3: Background Tasks.\nIntegrate Celery and Redis to handle heavy async queues like email campaigns or image manipulations.\n\n5/ Master Django early to build production-grade web assets instantly. #Django #Python #SaaSCoding",
      instagram: "Ready to scale your code? 🐍\n\nDjango gives Python developers the superpower to launch production-ready backends in a weekend. From its built-in admin dashboard to clean ORM relationships, it eliminates structural scaffolding.\n\nComment 'DJANGO' below to get our interactive 2026 mastery roadmap directly in your DMs!",
      facebook: "Building a SaaS shouldn't require re-inventing authentication or core DB schemas. That is why Django remains key. It implements strict default guardrails against major security exploits.",
      youtube_desc: "A hands-on video breakdown explaining our Django learning roadmap. Learn MVC structures, how the ORM communicates, and integration with DRF APIs.",
      youtube_script: "[Opening Shot: High-energy coding workspace]\nHost: Let's face it - modern full-stack development is cluttered. Today, space-time efficiency is key. Enter: Django.\n[Cut to Screen Share: Showing Models setup]\nHost: In this video, we build a scaling backend from absolute scratch. First, let's look at the Django ORM...",
      blog_outline: "# Master Django Backend in 4 Weeks\n1. Introduction to Django Batteries-Included Design\n2. Unlocking the Power of Django ORM\n3. Building APIs with Django REST Framework\n4. Asynchronous Architecture with Celery & Redis",
      blog_article: "# The Ultimate 2026 Django Learning Roadmap\nDjango is Python's premier high-level framework that encourages rapid, clean design. For developers trying to go from basic scripts to scalable production applications, Django bridges the gap perfectly.\n\n## Week 1: Structural Foundations\nTo command Django, you must master the Model-View-Template pattern. Django's auto-configured routing routes direct client ingress securely. Avoid raw queries; instead, use the high-level ORM.\n\n## Week 2: REST APIs & DRF\nModern SPAs need secure REST endpoints. Django REST Framework wraps around your Models elegantly, allowing tokenized validation and automatic documentation headers.",
      marketing: "Stop rebuilding common auth modules or simple routers. ContentForge AI structures standard Django plans in a minute. Publish like a pro.",
      hashtags: ["python", "django", "programming", "softwaredevelopment", "fullstack", "saascoding", "webdev"],
      seoMeta: {
        title: "Django Learning: The Definite 2026 Developer Roadmap",
        description: "Master Django, Python's premiere high-level backend framework. Discover security guardrails, DRF API creation, and async Celery queues.",
        score: 92,
        suggestions: ["Add 2 more internal links", "Include comparison table against FastAPI", "Optimize heading hierarchy"],
        internalLinks: ["/blog/mastering-python-basics", "/blog/saas-scaling-strategies"],
        faqs: [
          { q: "Is Django good for beginners?", a: "Yes! While it features a steeper initial learning curve than Flask, its batteries-included philosophy creates safer habits." },
          { q: "Does Django support async endpoints?", a: "Yes, since Django 3.0+ async views are fully integrated." }
        ],
        cta: "Sign up at ContentForge to unlock full Django developer blueprint templates!"
      }
    }
  }
];

let activityLogs = [
  { id: "log-1", user: "Sarah Connor", action: "Approved scheduled post: '10 Commandments'", timestamp: new Date(Date.now() - 1200000).toISOString() },
  { id: "log-2", user: "Kenji Sato", action: "Created brand profile: TechSphere", timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: "log-3", user: "System", action: "Auto-published Scheduled post: 'Weekly SaaS Digest'", timestamp: new Date(Date.now() - 3600000 * 24).toISOString() }
];

// ---------------------------------------------------------
// REST API Server Routes
// ---------------------------------------------------------

// Auth APIs (Mock JWT Authentication API)
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = teamMembers.find(m => m.email.toLowerCase() === email.toLowerCase());
  if (user) {
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        creditsLimit: apiCreditsLimit,
        creditsUsed: apiCreditsUsed,
        subscriptionPlan: currentSubscription,
        createdAt: "2026-01-10T12:00:00Z"
      }
    });
  } else {
    // Return standard fallback user if first login / any credential used
    res.json({
      success: true,
      user: {
        id: "usr-default",
        email: email || "rishabhgupta.ffm@gmail.com",
        fullName: "Rishabh Gupta",
        role: "Owner",
        creditsLimit: apiCreditsLimit,
        creditsUsed: apiCreditsUsed,
        subscriptionPlan: currentSubscription,
        createdAt: "2026-06-12T10:00:00Z"
      }
    });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { email, fullName } = req.body;
  res.json({
    success: true,
    user: {
      id: "usr-" + Math.floor(Math.random() * 10000),
      email,
      fullName,
      role: "Owner",
      creditsLimit: 20, // Free
      creditsUsed: 0,
      subscriptionPlan: "Free",
      createdAt: new Date().toISOString()
    }
  });
});

app.get("/api/auth/me", (req, res) => {
  // Always return Owner for current live developer email
  res.json({
    id: "usr-default",
    email: "rishabhgupta.ffm@gmail.com",
    fullName: "Rishabh Gupta",
    role: "Owner",
    creditsLimit: currentSubscription === "Free" ? 20 : (currentSubscription === "Pro" ? 100 : 500),
    creditsUsed: apiCreditsUsed,
    subscriptionPlan: currentSubscription,
    createdAt: "2026-06-12T10:00:00Z"
  });
});

// Brand Voice Profile APIs
app.get("/api/settings/brand-voice", (req, res) => {
  res.json(brandProfiles);
});

app.post("/api/settings/brand-voice", (req, res) => {
  const { name, industry, targetAudience, tone, writingStyle, keywords } = req.body;
  const newProfile = {
    id: "brand-" + Math.floor(Math.random() * 10000),
    name: name || "New Profile",
    industry: industry || "Tech",
    targetAudience: targetAudience || "General Buyers",
    tone: tone || "Professional",
    writingStyle: writingStyle || "",
    keywords: keywords || []
  };
  brandProfiles.push(newProfile);
  res.json({ success: true, profile: newProfile });
});

// Admin Panel APIs
app.get("/api/admin/stats", (req, res) => {
  const totalRevenue = currentSubscription === "Pro" ? 1200 : (currentSubscription === "Business" ? 4500 : 150);
  res.json({
    totalUsers: teamMembers.length + 42,
    activeSubscriptions: currentSubscription === "Free" ? 3 : (currentSubscription === "Pro" ? 24 : 48),
    totalRevenue,
    aiUsage: apiCreditsUsed,
    limit: currentSubscription === "Free" ? 20 : (currentSubscription === "Pro" ? 100 : 500),
    systemHealth: "100% Operational",
    featureFlags: {
      "repurpose-engine": true,
      "email-marketing-v2": true,
      "unlimited-celery-scheduler": true,
    }
  });
});

// Content Projects Retrieval APIs
app.get("/api/projects", (req, res) => {
  res.json(contentProjects);
});

// Team Comments / Approval APIs
app.get("/api/team/comments", (req, res) => {
  res.json(comments);
});

app.post("/api/team/comments", (req, res) => {
  const { text, postId, projectId } = req.body;
  const newComment = {
    id: "c-" + Math.floor(Math.random() * 10000),
    postId,
    projectId,
    authorName: "Rishabh Gupta",
    authorRole: "Owner",
    text,
    createdAt: new Date().toISOString()
  };
  comments.push(newComment);
  res.json({ success: true, comment: newComment });
});

app.get("/api/team/members", (req, res) => {
  res.json(teamMembers);
});

app.post("/api/team/invite", (req, res) => {
  const { fullName, email, role } = req.body;
  const newMember = {
    id: "tm-" + Math.floor(Math.random() * 10000),
    fullName,
    email,
    role,
    status: "Invited"
  };
  teamMembers.push(newMember);
  res.json({ success: true, member: newMember });
});

// Scheduler & Calendar APIs
app.get("/api/scheduler/posts", (req, res) => {
  res.json(scheduledPosts);
});

app.post("/api/scheduler/posts", (req, res) => {
  const { title, content, platforms, scheduledTime, mediaUrl, status } = req.body;
  const newPost = {
    id: "post-" + Math.floor(Math.random() * 10000),
    title: title || "Untitled Draft",
    content: content || "",
    platforms: platforms || ["LinkedIn"],
    scheduledTime: scheduledTime || new Date(Date.now() + 86400000).toISOString(),
    status: status || "Draft",
    approvalStatus: "Approved",
    mediaUrl: mediaUrl || ""
  };
  scheduledPosts.push(newPost);
  res.json({ success: true, post: newPost });
});

app.post("/api/scheduler/approve/:id", (req, res) => {
  const { id } = req.params;
  const { approve } = req.body;
  const post = scheduledPosts.find(p => p.id === id);
  if (post) {
    post.approvalStatus = approve ? "Approved" : "Declined";
    if (approve) post.status = "Scheduled";
    res.json({ success: true, post });
  } else {
    res.status(404).json({ error: "Post not found" });
  }
});

// Content Calendar APIs
app.get("/api/calendar/items", (req, res) => {
  res.json(calendarItems);
});

app.post("/api/calendar/items", (req, res) => {
  const { topic, platform, postingTime, goal, cta, date } = req.body;
  const newItem = {
    id: "cal-" + Math.floor(Math.random() * 10000),
    topic,
    platform,
    postingTime,
    goal,
    cta,
    date
  };
  calendarItems.push(newItem);
  res.json({ success: true, item: newItem });
});

// Subscription Upgrade (Razorpay Sim) Route
app.post("/api/payments/subscribe", (req, res) => {
  const { plan } = req.body;
  currentSubscription = plan;
  res.json({
    success: true,
    transactionId: "pay_rzp_" + Math.random().toString(36).substring(7),
    plan,
    msg: `Successfully upgraded subscription to ${plan} tier using simulated Razorpay flow!`
  });
});

// Analytics APIs (Views, Clicks, Engagement metrics)
app.get("/api/analytics/overview", (req, res) => {
  res.json({
    totals: {
      views: 124500,
      clicks: 8400,
      engagement: 34500,
      ctr: 6.7,
      shares: 1240,
      growth: 24.5
    },
    daily: [
      { date: "Jun 06", views: 2400, clicks: 120, engagement: 450 },
      { date: "Jun 07", views: 3200, clicks: 180, engagement: 610 },
      { date: "Jun 08", views: 4100, clicks: 230, engagement: 820 },
      { date: "Jun 09", views: 5800, clicks: 310, engagement: 1100 },
      { date: "Jun 10", views: 7900, clicks: 420, engagement: 1450 },
      { date: "Jun 11", views: 12100, clicks: 810, engagement: 2300 },
      { date: "Jun 12", views: 14200, clicks: 950, engagement: 2800 },
    ],
    weekly: [
      { week: "Week 1", views: 25000, clicks: 1400, engagement: 5600 },
      { week: "Week 2", views: 32000, clicks: 1900, engagement: 7400 },
      { week: "Week 3", views: 42000, clicks: 2800, engagement: 11200 },
      { week: "Week 4", views: 54000, clicks: 3600, engagement: 14800 },
    ],
    monthly: [
      { month: "Mar", views: 89000, clicks: 5200, engagement: 21000 },
      { month: "Apr", views: 104000, clicks: 6800, engagement: 25400 },
      { month: "May", views: 112000, clicks: 7900, engagement: 29800 },
      { month: "Jun", views: 124500, clicks: 8400, engagement: 34500 },
    ]
  });
});


// -----------------------------------------------------------------------------
// CORE FEATURE 1 & 3: Gemini Powered Content Generators (Safe Falling Back)
// -----------------------------------------------------------------------------

app.post("/api/generate/content", async (req, res) => {
  const { topic, brandVoiceId } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  apiCreditsUsed += 1;
  const brand = brandProfiles.find(b => b.id === brandVoiceId);
  const ai = getGeminiClient();

  // If we have an active real client, attempt generating with Google GenAI SDK.
  if (ai) {
    try {
      const brandContext = brand
        ? `Align the content with the following brand profile: Name: ${brand.name}, Target Audience: ${brand.targetAudience}, Writing Tone: ${brand.tone}, Style Instructions: ${brand.writingStyle}.`
        : "Format writing with highly engaging, platform-custom structures and modern premium spacing.";

      const prompt = `You are ContentForge AI, an expert copywriter. Write diverse content items for the topic: "${topic}".
      Provide 4 distinct, fully rendered posts, plus hashtags:
      1. An influential LinkedIn Post (bold hooks, clear paragraph spacings, bullet items, low emoji usage).
      2. A viral Instagram Caption with conversational elements and interactive tags.
      3. A Twitter masterthread (formatted with "1/", "2/", "3/" line breaks, max 280 chars per piece).
      4. A YouTube scripting video outline with timestamps and action descriptions.
      
      ${brandContext}

      Format your output strictly as a JSON object matching this schema:
      {
        "linkedin": "LinkedIn text...",
        "instagram": "Instagram text...",
        "twitter": "Twitter thread...",
        "youtube_script": "YouTube script text...",
        "hashtags": ["tag1", "tag2", "tag3"]
      }
      
      Response MUST be in clean standard JSON. Only return JSON. Do not wrap in markdown quotes.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.8,
        }
      });
      
      const text = response.text || "{}";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      const project = {
        id: "proj-" + Math.floor(Math.random() * 10000),
        title: topic + " Suite",
        topic,
        brandVoiceId,
        generatedAt: new Date().toISOString(),
        content: parsed
      };
      contentProjects.push(project);
      return res.json({ success: true, project });
    } catch (e) {
      console.warn("AI generation failed, launching smart fallback model response:", e);
    }
  }

  // Beautiful Smart Fallback Response (If Gemini API key not present or errors out)
  const fallbackProject = {
    id: "proj-" + Math.floor(Math.random() * 10000),
    title: topic + " Suite",
    topic,
    brandVoiceId,
    generatedAt: new Date().toISOString(),
    content: {
      linkedin: `📈 Scaling our approach to "${topic}" is the easiest way to stack long-term growth gains.\n\nMost people fail because they think consistency requires starting from zero. It doesn't. Great creators repurpose aggressively.\n\nHere's our 3-step master framework for ${topic}:\n1️⃣ Isolate the high-leverage key concepts early\n2️⃣ Script high-quality, lightweight outlines\n3️⃣ Distribute across multiple nodes instantly\n\nWhat is your current bottleneck with "${topic}"? Let's discuss in the threads.`,
      instagram: `Transforming your approach to ${topic} starts with focus. The truth is simple: you don't need more hours, you need a smarter system. \n\nSave this checklist for your next creative planning cycle! 👇\n\n✨ Focus on leverage\n🎯 Dial in the voice\n⚡ Distribute everywhere`,
      twitter: `1/ Mastering ${topic} isn't complicated. But 90% of brands make the same critical mistakes. Let me break down the optimal strategy for 2026. 👇\n\n2/ First, define the main thesis. Always make sure your topic speaks to a singular point of user friction. Don't diluted the impact with multi-focus lines.\n\n3/ Second, streamline content delivery. Utilize clean layouts, mono-spaced tags, and dynamic tracking summaries to keep visual readers locked in.\n\n4/ Build once, distribute 10x. Elevate your delivery standard today.`,
      youtube_script: `[00:00 - Introduction Hook]\n"Are you struggling with ${topic}? In this video, we outline the exact formula that took us from zero to 10k views in 30 days."\n\n[01:15 - Core Blueprint]\n"Let's break down the mechanics. It starts with analyzing your baseline metrics and implementing automated calendars..."\n\n[03:45 - Key CTA]\n"If you want to accelerate your workflow, head over to contentforge.com to clone this blueprint."`,
      hashtags: [topic.toLowerCase().replace(/\s+/g, ""), "marketing", "worksmart", "creatorconomy", "growthhacks"]
    }
  };
  contentProjects.push(fallbackProject as any);
  return res.json({ success: true, project: fallbackProject });
});

// -----------------------------------------------------------------------------
// CORE FEATURE 2: AI Blog Writer
// -----------------------------------------------------------------------------
app.post("/api/generate/blog", async (req, res) => {
  const { topic, wordCount, brandVoiceId } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  apiCreditsUsed += 2;
  const brand = brandProfiles.find(b => b.id === brandVoiceId);
  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `You are ContentForge AI, writing an SEO-optimized Blog Article for topic: "${topic}" with length constraint: "${wordCount || 1000} words".
      Generate highly structured content complete with meta title, meta description, FAQ, SEO suggestions, internal links, and bullet points. Give it an SEO Score of 85+.
      
      Tone requirements: ${brand ? brand.tone : "Professional and engaging"}.
      
      Format strictly as a JSON object matching this schema:
      {
        "blog_article": "Markdown formatted blog text...",
        "blog_outline": "Simple markdown outline...",
        "seoMeta": {
          "title": "Optimized blog title",
          "description": "Optimized meta description",
          "score": 94,
          "suggestions": ["suggestion 1", "suggestion 2"],
          "internalLinks": ["/blog/related-link-1", "/blog/related-link-2"],
          "faqs": [{"q": "faq question?", "a": "faq answer"}],
          "cta": "Call to action text"
        }
      }
      
      Only return valid JSON. Do not wrap in markdown boxes.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.75,
        }
      });
      const text = response.text || "{}";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      const project = {
        id: "proj-" + Math.floor(Math.random() * 10000),
        title: topic + " Article",
        topic,
        brandVoiceId,
        generatedAt: new Date().toISOString(),
        content: parsed
      };
      contentProjects.push(project);
      return res.json({ success: true, project });
    } catch (e) {
      console.error(e);
    }
  }

  const fallbackArticle = {
    id: "proj-" + Math.floor(Math.random() * 10000),
    title: topic + " Article",
    topic,
    brandVoiceId,
    generatedAt: new Date().toISOString(),
    content: {
      blog_outline: `# Ultimate Guide to ${topic}\n## 1. Navigating Core Obstacles\n## 2. Implementing the Scaling Framework\n## 3. SEO Optimization Best Practices`,
      blog_article: `# The Ultimate Masterclass: Conquering ${topic} in 2026\n\nIn an ultra-competitive media landscape, staying top-of-mind is incredibly difficult. Businesses that leverage high-quality writing around **${topic}** build stable customer acquisition flywheels with minimal budget.\n\n## Understanding the Core Dynamics\nTo get started, you must audit your current distribution structure. Most agencies fail because they push low-value content repeatedly. By investing in depth, your organic indexing ranks higher.\n\n### Practical Implementation Tips\n1. Target long-tail search intent to acquire high-intent users.\n2. Add high-contrast diagrams or statistics directly in the header section.\n3. Make headlines clear and action-oriented.\n\n## Conclusion\nBy streamlining your output pipeline, you will see a multi-fold lift in search volume. Start applying these principles to your next campaign.`,
      seoMeta: {
        title: `Perfect Guide to ${topic} | 2026 Strategy`,
        description: `Learn how to master and scale ${topic} with our comprehensive SEO handbook. Complete with action items, checklists, and outlines.`,
        score: 87,
        suggestions: [
          "Include a comparison chart",
          "Add 3 more h3 headers",
          "Embed 2 high-conversion CTAs"
        ],
        internalLinks: ["/blog/why-consistency-beats-viral-reach", `/blog/advanced-${topic.toLowerCase()}-metrics`],
        faqs: [
          { q: `Why should I focus on ${topic} today?`, a: `Because the organic search intent and traffic indexes are at historic highs.` },
          { q: `What is the optimal posting size?`, a: `We suggest long-form articles with at least 1500 words to establish high search indexing value.` }
        ],
        cta: "Sign up at ContentForge to unlock full access to our custom blog themes!"
      }
    }
  };
  contentProjects.push(fallbackArticle as any);
  return res.json({ success: true, project: fallbackArticle });
});


// -----------------------------------------------------------------------------
// CORE FEATURE 4: AI Hashtag Generator
// -----------------------------------------------------------------------------
app.post("/api/generate/hashtags", (req, res) => {
  const { keyword } = req.body;
  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }
  // Fast premium-formatted hashtag scores simulation
  const cleanedKW = keyword.replace(/\s+/g, "").toLowerCase();
  const generation = {
    trending: [
      { tag: `#${cleanedKW}2026`, popularity: 98, competition: 84 },
      { tag: `#${cleanedKW}tips`, popularity: 91, competition: 62 },
      { tag: `#learn${cleanedKW}`, popularity: 88, competition: 44 }
    ],
    niche: [
      { tag: `#${cleanedKW}secrets`, popularity: 74, competition: 28 },
      { tag: `#${cleanedKW}hacks`, popularity: 69, competition: 31 },
      { tag: `#${cleanedKW}developers`, popularity: 65, competition: 19 }
    ],
    keywords: [
      { term: `best ${keyword} tools`, volume: "12k/mo", competition: "Low" },
      { term: `${keyword} roadmap for startups`, volume: "4.2k/mo", competition: "Medium" },
      { term: `learn ${keyword} free`, volume: "25k/mo", competition: "High" }
    ]
  };
  res.json({ success: true, data: generation });
});


// -----------------------------------------------------------------------------
// CORE FEATURE 5: AI Content Calendar Generator (30 Day Blueprint)
// -----------------------------------------------------------------------------
app.post("/api/generate/calendar", (req, res) => {
  const { topic, platform } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  // Generate a customized 30-day calendar plan distributed over future dates
  const list: any[] = [];
  const platformsList = ["LinkedIn", "Instagram", "Facebook", "X/Twitter", "YouTube", "Email"];
  const goalsList = ["Lead Generation", "Brand Engagement", "Authority Positioning", "Education", "Product Launch Promotional Campaign"];
  const ctasList = ["Link in bio", "Comment below", "Subscribe to Newsletter", "Read article", "Watch video guide"];

  for (let i = 1; i <= 30; i++) {
    const targetDate = new Date(Date.now() + 86400000 * i).toISOString().split('T')[0];
    list.push({
      id: "cal-gen-" + i,
      topic: `Day ${i}: ${topic} - ${i % 2 === 0 ? "Strategic Breakdown" : "Practical Checklist Guide" + i}`,
      platform: platform && platform !== "All" ? platform : platformsList[i % platformsList.length],
      postingTime: `${8 + (i % 5)}:00 ${i % 2 === 0 ? "AM" : "PM"}`,
      goal: goalsList[i % goalsList.length],
      cta: ctasList[i % ctasList.length],
      date: targetDate
    });
  }

  calendarItems = list; // Update active calendar database
  res.json({ success: true, calendar: list });
});


// -----------------------------------------------------------------------------
// CORE FEATURE 7: AI Video Content Assistant
// -----------------------------------------------------------------------------
app.post("/api/generate/video", async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }
  
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Write a video scripting concept for: "${topic}".
      Return detailed structural sections:
      - 3 Viral Hooks ideas (high suspense, question-based, counter-intuitive).
      - A script outline for TikTok / Reels (60 seconds).
      - Complete title recommendations (highly clickable, optimal CTR).
      - Description block with call to action.

      Deliver strictly in valid JSON format:
      {
        "hooks": ["hook 1", "hook 2", "hook 3"],
        "shortsScript": "TikTok script format...",
        "titles": ["Title 1", "Title 2"],
        "desc": "Description text with CTA..."
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const text = response.text || "{}";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.json({ success: true, data: parsed });
    } catch (e) {
      console.warn("Gemini video generation failed, fallback launching", e);
    }
  }

  const fallbackVideoData = {
    hooks: [
      `🚨 "Stop wasting hours programming ${topic} using the wrong modules!"`,
      `🤔 "99% of developers don't know this simple ${topic} hidden trick..."`,
      `💡 "No more slow setups. Here is how I structure ${topic} in under 2 minutes."`
    ],
    shortsScript: "[00:00 - Point at screen]\n\"This single blueprint changed everything for our software distribution...\"\n\n[00:15 - Speak to camera]\n\"Instead of setting up boilerplate endpoints manually, we leveraged high-leverage frameworks.\"\n\n[00:40 - Show code side-by-side]\n\"Save these 4 lines of configuration instantly.\"\n\n[00:55 - CTA]\n\"Grab the full roadmap template in our profile bio!\"",
    titles: [
      `I Built a ${topic} App in 10 Minutes (And you can too!)`,
      `How to Learn ${topic} From Absolute Beginner to Expert`
    ],
    desc: `Watch our full tutorial detailing perfect scaling for ${topic}. Master advanced schemas, clean routers, and rapid optimization tricks.\n\n👉 Subscribe to learn more.`
  };
  res.json({ success: true, data: fallbackVideoData });
});


// -----------------------------------------------------------------------------
// CORE FEATURE 12: AI Content Repurposing (Blog to Social)
// -----------------------------------------------------------------------------
app.post("/api/generate/repurpose", (req, res) => {
  const { blogPost } = req.body;
  if (!blogPost) {
    return res.status(400).json({ error: "Source blog content is required." });
  }

  // Rapid beautiful content extraction repurposer
  const snippet = blogPost.substring(0, 100) + "...";
  const repurposeResult = {
    linkedin: `📌 Repurposed Case Study from: "${snippet}"\n\nConsistency in execution beats absolute perfection every time.\n\nKey takeaways summed up:\n• Systemize your media pipeline early\n• Leverage high-performing assets continuously\n• Keep communication direct and humbler.\n\nRead the full blog at contentforge.ai`,
    twitter: `1/ Repurposing a major play from our blog on: "${snippet}"\n\nHere is how to apply it today to triple your organic visibility. 👇\n\n2/ Build one solid asset. Focus fully on depth, accuracy, page-indexing, and actionable rules.\n\n3/ Break it down into modular pieces. A single 2000-word blog holds 5 LinkedIn items easily.\n\n4/ Automate. Plan, schedule, and approve from a unified control dashboard.`,
    instagram: `💡 Quick takeaway: "${snippet}" \n\nStop overcomplicating your planning workflow. Take one great piece, distill the actionable rules, and show up everywhere, elegantly.\n\nHit save to refer back!`,
    newsletter: `Hi Community,\n\nWe just repurposed our complete blueprint on: "${blogPost.substring(0, 50)}".\n\nIn this newsletter, we detail why scaling is crucial and how to bypass common performance bottlenecks.\n\nBest,\nContentForge Tech Team`
  };
  res.json({ success: true, data: repurposeResult });
});


// -----------------------------------------------------------------------------
// CORE FEATURE 13: AI Email Marketing Generator
// -----------------------------------------------------------------------------
app.post("/api/generate/email", async (req, res) => {
  const { campaignType, topic } = req.body;
  
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Write an Email Marketing campaign for type: "${campaignType}" and topic: "${topic}".
      Provide 2 clickable Subject Line ideas, and full HTML/Plain-text formatted body script. Include template variables like [First Name], [Brand Name].

      Deliver strictly in valid JSON format:
      {
        "subjects": ["Subject 1...", "Subject 2..."],
        "body": "Hi [First Name],\\n\\nWelcome to..."
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const text = response.text || "{}";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.json({ success: true, data: parsed });
    } catch (e) {
      console.warn("Email generation fallback activated:", e);
    }
  }

  const emailTemplates: Record<string, any> = {
    welcome: {
      subjects: [`Welcome to Custom Scale! Let's get started`, `Inside: Your quickstart roadmap guide`],
      body: `Hi [First Name],\n\nWelcome to [Brand Name]! We are thrilled to have you join our scaling community.\n\nOur mission is to help you automate content Creation, Scheduling, and SEO workflows so you can focus entirely on craft.\n\nHere is your immediate launch item:\n👉 Complete your AI Brand Voice configuration in the core dashboard.\n\nWe can't wait to see what you build.\n\nBest,\n[Brand Name]-team`
    },
    sales: {
      subjects: [`Save 4 hours on writing this week`, `Ready to scale your content pipeline?`],
      body: `Hi [First Name],\n\nWriting high-scoring search assets normally takes days of research, keyword matching, and scripting.\n\nWith ContentForge AI, we bundle optimized posts, hashtags, outlines, and calendars in 10 seconds flat.\n\nTo help you get started, use the link below to get 30% off your Pro monthly license:\n👉 Unlock pricing savings today.\n\nBest,\n[Brand Name] founder`
    },
    launch: {
      subjects: [`We are LIVE: ContentForge AI scheduler is here`, `No more manual publishing (it is live!)`],
      body: `Hi [First Name],\n\nToday, we are officially launching the automated Content Calendar Scheduler.\n\nYou can now schedule to LinkedIn, Instagram, Facebook, and Twitter with a single approval click.\n\nCheck out the live dashboard to review team comments and workflow calendars.\n\nBest,\n[Brand Name] release engineering`
    }
  };

  const selected = emailTemplates[campaignType] || emailTemplates.welcome;
  res.json({ success: true, data: selected });
});


// ---------------------------------------------------------
// Standard Static Servings / Vite Integration
// ---------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
    if (process.env.GEMINI_API_KEY) {
      console.log("Gemini API Key detected. Real LLM Generation is active!");
    } else {
      console.log("No Gemini API key specified. Using high-fidelity smart fallback engine.");
    }
  });
}

startServer();
