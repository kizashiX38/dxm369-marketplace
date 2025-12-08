// src/lib/emailMarketing.ts
// Email Marketing System for DXM369
// Newsletter subscriptions, deal alerts, and automated campaigns

import { DealRadarItem, HardwareCategory } from "@/lib/dealRadar";
import { DealAlert } from "@/lib/dealDetection";
import { buildAmazonLink } from "@/lib/affiliateConfig";

// Subscriber interface
export interface EmailSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  preferences: {
    categories: HardwareCategory[];
    priceRange?: { min: number; max: number };
    dealThreshold: number; // Minimum % discount to notify
    frequency: "instant" | "daily" | "weekly";
    dxmScoreThreshold: number; // Minimum DXM score to notify
  };
  status: "active" | "unsubscribed" | "bounced" | "pending";
  subscribedAt: Date;
  lastEmailSent?: Date;
  clickCount: number;
  openCount: number;
  tags: string[];
  source: string; // Where they subscribed from
}

// Email template types
export type EmailTemplateType = 
  | "welcome"
  | "daily_digest" 
  | "weekly_roundup"
  | "price_alert"
  | "flash_sale"
  | "trending_deals"
  | "unsubscribe_confirmation";

// Email template interface
export interface EmailTemplate {
  id: string;
  type: EmailTemplateType;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[]; // Template variables like {{firstName}}, {{dealCount}}
}

// Email campaign interface
export interface EmailCampaign {
  id: string;
  name: string;
  type: EmailTemplateType;
  template: EmailTemplate;
  recipients: EmailSubscriber[];
  scheduledAt?: Date;
  sentAt?: Date;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    bounced: number;
  };
}

// Deal alert criteria
export interface DealAlertCriteria {
  categories: HardwareCategory[];
  minDiscount: number;
  maxPrice?: number;
  minDxmScore: number;
  keywords?: string[];
}

// Email service configuration
interface EmailServiceConfig {
  provider: "sendgrid" | "resend" | "mailgun" | "ses";
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
}

// Main email marketing class
export class EmailMarketingService {
  private config: EmailServiceConfig;
  private subscribers = new Map<string, EmailSubscriber>();
  private templates = new Map<string, EmailTemplate>();
  private campaigns = new Map<string, EmailCampaign>();

  constructor(config: EmailServiceConfig) {
    this.config = config;
    this.initializeTemplates();
  }

  // Subscriber management
  async subscribe(
    email: string, 
    preferences: Partial<EmailSubscriber["preferences"]>, 
    source: string = "website",
    firstName?: string,
    lastName?: string
  ): Promise<{ success: boolean; subscriberId?: string; error?: string }> {
    try {
      // Validate email
      if (!this.isValidEmail(email)) {
        return { success: false, error: "Invalid email address" };
      }

      // Check if already subscribed
      const existingSubscriber = Array.from(this.subscribers.values())
        .find(sub => sub.email.toLowerCase() === email.toLowerCase());

      if (existingSubscriber) {
        if (existingSubscriber.status === "active") {
          return { success: false, error: "Email already subscribed" };
        } else {
          // Reactivate if previously unsubscribed
          existingSubscriber.status = "active";
          existingSubscriber.preferences = { ...existingSubscriber.preferences, ...preferences };
          return { success: true, subscriberId: existingSubscriber.id };
        }
      }

      // Create new subscriber
      const subscriber: EmailSubscriber = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email.toLowerCase(),
        firstName,
        lastName,
        preferences: {
          categories: preferences.categories || ["gpu", "cpu", "laptop"],
          priceRange: preferences.priceRange,
          dealThreshold: preferences.dealThreshold || 15, // 15% discount threshold
          frequency: preferences.frequency || "daily",
          dxmScoreThreshold: preferences.dxmScoreThreshold || 8.0
        },
        status: "pending", // Will be activated after email confirmation
        subscribedAt: new Date(),
        clickCount: 0,
        openCount: 0,
        tags: [],
        source
      };

      this.subscribers.set(subscriber.id, subscriber);

      // Send welcome email
      await this.sendWelcomeEmail(subscriber);

      return { success: true, subscriberId: subscriber.id };

    } catch (error) {
      console.error("[EMAIL_SUBSCRIBE_ERROR]", error);
      return { success: false, error: "Failed to subscribe" };
    }
  }

  async unsubscribe(subscriberId: string): Promise<boolean> {
    const subscriber = this.subscribers.get(subscriberId);
    if (!subscriber) return false;

    subscriber.status = "unsubscribed";
    
    // Send unsubscribe confirmation
    await this.sendUnsubscribeConfirmation(subscriber);
    
    return true;
  }

  // Deal alert system
  async sendDealAlerts(deals: DealRadarItem[]): Promise<void> {
    const activeSubscribers = Array.from(this.subscribers.values())
      .filter(sub => sub.status === "active");

    for (const subscriber of activeSubscribers) {
      const relevantDeals = this.filterDealsForSubscriber(deals, subscriber);
      
      if (relevantDeals.length > 0) {
        await this.sendDealAlert(subscriber, relevantDeals);
      }
    }
  }

  async sendFlashSaleAlert(alerts: DealAlert[]): Promise<void> {
    const activeSubscribers = Array.from(this.subscribers.values())
      .filter(sub => sub.status === "active" && sub.preferences.frequency === "instant");

    const flashSaleAlerts = alerts.filter(alert => alert.type === "flash_sale");
    
    if (flashSaleAlerts.length === 0) return;

    for (const subscriber of activeSubscribers) {
      const relevantAlerts = flashSaleAlerts.filter(alert => 
        subscriber.preferences.categories.includes(alert.product.category) &&
        alert.product.price <= (subscriber.preferences.priceRange?.max || Infinity) &&
        alert.product.dxmScore >= subscriber.preferences.dxmScoreThreshold
      );

      if (relevantAlerts.length > 0) {
        await this.sendFlashSaleEmail(subscriber, relevantAlerts);
      }
    }
  }

  // Campaign management
  async createDailyDigest(): Promise<void> {
    const dailySubscribers = Array.from(this.subscribers.values())
      .filter(sub => sub.status === "active" && sub.preferences.frequency === "daily");

    if (dailySubscribers.length === 0) return;

    // Get today's best deals
    // This would integrate with your deal detection system
    const todaysDeals: DealRadarItem[] = []; // Placeholder

    for (const subscriber of dailySubscribers) {
      const personalizedDeals = this.filterDealsForSubscriber(todaysDeals, subscriber);
      
      if (personalizedDeals.length > 0) {
        await this.sendDailyDigest(subscriber, personalizedDeals);
      }
    }
  }

  async createWeeklyRoundup(): Promise<void> {
    const weeklySubscribers = Array.from(this.subscribers.values())
      .filter(sub => sub.status === "active" && sub.preferences.frequency === "weekly");

    // Implementation for weekly roundup
    // This would include trending products, price drops, new arrivals, etc.
  }

  // Email sending methods
  private async sendWelcomeEmail(subscriber: EmailSubscriber): Promise<boolean> {
    const template = this.templates.get("welcome");
    if (!template) return false;

    const personalizedContent = this.personalizeTemplate(template, {
      firstName: subscriber.firstName || "Hardware Enthusiast",
      email: subscriber.email,
      subscriberId: subscriber.id
    });

    return await this.sendEmail(
      subscriber.email,
      personalizedContent.subject,
      personalizedContent.htmlContent,
      personalizedContent.textContent
    );
  }

  private async sendDealAlert(subscriber: EmailSubscriber, deals: DealRadarItem[]): Promise<boolean> {
    const template = this.templates.get("price_alert");
    if (!template) return false;

    const dealListHtml = deals.map(deal => this.generateDealCardHtml(deal)).join("");
    const dealListText = deals.map(deal => this.generateDealCardText(deal)).join("\n\n");

    const personalizedContent = this.personalizeTemplate(template, {
      firstName: subscriber.firstName || "Hardware Enthusiast",
      dealCount: deals.length.toString(),
      dealListHtml,
      dealListText,
      unsubscribeUrl: `https://dxm369.com/unsubscribe?id=${subscriber.id}`
    });

    const success = await this.sendEmail(
      subscriber.email,
      personalizedContent.subject,
      personalizedContent.htmlContent,
      personalizedContent.textContent
    );

    if (success) {
      subscriber.lastEmailSent = new Date();
    }

    return success;
  }

  private async sendFlashSaleEmail(subscriber: EmailSubscriber, alerts: DealAlert[]): Promise<boolean> {
    const template = this.templates.get("flash_sale");
    if (!template) return false;

    const alertsHtml = alerts.map(alert => this.generateFlashSaleHtml(alert)).join("");
    const alertsText = alerts.map(alert => this.generateFlashSaleText(alert)).join("\n\n");

    const personalizedContent = this.personalizeTemplate(template, {
      firstName: subscriber.firstName || "Hardware Enthusiast",
      alertCount: alerts.length.toString(),
      alertsHtml,
      alertsText,
      unsubscribeUrl: `https://dxm369.com/unsubscribe?id=${subscriber.id}`
    });

    return await this.sendEmail(
      subscriber.email,
      personalizedContent.subject,
      personalizedContent.htmlContent,
      personalizedContent.textContent
    );
  }

  private async sendDailyDigest(subscriber: EmailSubscriber, deals: DealRadarItem[]): Promise<boolean> {
    const template = this.templates.get("daily_digest");
    if (!template) return false;

    // Categorize deals
    const gpuDeals = deals.filter(d => d.category === "gpu").slice(0, 3);
    const cpuDeals = deals.filter(d => d.category === "cpu").slice(0, 3);
    const laptopDeals = deals.filter(d => d.category === "laptop").slice(0, 3);

    const personalizedContent = this.personalizeTemplate(template, {
      firstName: subscriber.firstName || "Hardware Enthusiast",
      date: new Date().toLocaleDateString(),
      totalDeals: deals.length.toString(),
      gpuDealsHtml: gpuDeals.map(d => this.generateDealCardHtml(d)).join(""),
      cpuDealsHtml: cpuDeals.map(d => this.generateDealCardHtml(d)).join(""),
      laptopDealsHtml: laptopDeals.map(d => this.generateDealCardHtml(d)).join(""),
      unsubscribeUrl: `https://dxm369.com/unsubscribe?id=${subscriber.id}`
    });

    return await this.sendEmail(
      subscriber.email,
      personalizedContent.subject,
      personalizedContent.htmlContent,
      personalizedContent.textContent
    );
  }

  private async sendUnsubscribeConfirmation(subscriber: EmailSubscriber): Promise<boolean> {
    const template = this.templates.get("unsubscribe_confirmation");
    if (!template) return false;

    const personalizedContent = this.personalizeTemplate(template, {
      firstName: subscriber.firstName || "Hardware Enthusiast",
      email: subscriber.email
    });

    return await this.sendEmail(
      subscriber.email,
      personalizedContent.subject,
      personalizedContent.htmlContent,
      personalizedContent.textContent
    );
  }

  // Core email sending
  private async sendEmail(
    to: string, 
    subject: string, 
    htmlContent: string, 
    textContent: string
  ): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case "sendgrid":
          return await this.sendWithSendGrid(to, subject, htmlContent, textContent);
        case "resend":
          return await this.sendWithResend(to, subject, htmlContent, textContent);
        default:
          console.log(`[EMAIL_MOCK] To: ${to}, Subject: ${subject}`);
          return true; // Mock success for development
      }
    } catch (error) {
      console.error("[EMAIL_SEND_ERROR]", error);
      return false;
    }
  }

  private async sendWithSendGrid(to: string, subject: string, htmlContent: string, textContent: string): Promise<boolean> {
    // SendGrid implementation would go here
    // For now, return mock success
    return true;
  }

  private async sendWithResend(to: string, subject: string, htmlContent: string, textContent: string): Promise<boolean> {
    // Resend implementation would go here
    // For now, return mock success
    return true;
  }

  // Helper methods
  private filterDealsForSubscriber(deals: DealRadarItem[], subscriber: EmailSubscriber): DealRadarItem[] {
    return deals.filter(deal => {
      // Category filter
      if (!subscriber.preferences.categories.includes(deal.category)) return false;
      
      // Price range filter
      if (subscriber.preferences.priceRange) {
        if (deal.price < subscriber.preferences.priceRange.min || 
            deal.price > subscriber.preferences.priceRange.max) return false;
      }
      
      // DXM score filter
      if (deal.dxmScore < subscriber.preferences.dxmScoreThreshold) return false;
      
      // Deal threshold filter (discount percentage)
      if (deal.previousPrice) {
        const discount = ((deal.previousPrice - deal.price) / deal.previousPrice) * 100;
        if (discount < subscriber.preferences.dealThreshold) return false;
      }
      
      return true;
    });
  }

  private personalizeTemplate(template: EmailTemplate, variables: Record<string, string>): {
    subject: string;
    htmlContent: string;
    textContent: string;
  } {
    let subject = template.subject;
    let htmlContent = template.htmlContent;
    let textContent = template.textContent;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, "g"), value);
      htmlContent = htmlContent.replace(new RegExp(placeholder, "g"), value);
      textContent = textContent.replace(new RegExp(placeholder, "g"), value);
    }

    return { subject, htmlContent, textContent };
  }

  private generateDealCardHtml(deal: DealRadarItem): string {
    const discount = deal.previousPrice ? 
      Math.round(((deal.previousPrice - deal.price) / deal.previousPrice) * 100) : 0;

    return `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: white;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">${deal.title}</h3>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 18px; font-weight: bold; color: #059669;">$${deal.price.toFixed(2)}</span>
          ${discount > 0 ? `<span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px;">-${discount}%</span>` : ""}
        </div>
        <div style="margin-bottom: 12px;">
          <span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
            DXM Score: ${deal.dxmScore.toFixed(1)}/10
          </span>
        </div>
        <a href="${buildAmazonLink(deal.asin)}"
           style="display: inline-block; background: #2563eb; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px;">
          View Deal →
        </a>
      </div>
    `;
  }

  private generateDealCardText(deal: DealRadarItem): string {
    const discount = deal.previousPrice ?
      Math.round(((deal.previousPrice - deal.price) / deal.previousPrice) * 100) : 0;

    return `${deal.title}
Price: $${deal.price.toFixed(2)}${discount > 0 ? ` (${discount}% off)` : ""}
DXM Score: ${deal.dxmScore.toFixed(1)}/10
View Deal: ${buildAmazonLink(deal.asin)}`;
  }

  private generateFlashSaleHtml(alert: DealAlert): string {
    return `
      <div style="border: 2px solid #dc2626; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #fef2f2;">
        <div style="color: #dc2626; font-weight: bold; font-size: 12px; margin-bottom: 8px;">🔥 FLASH SALE</div>
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">${alert.product.title}</h3>
        <p style="margin: 0 0 8px 0; color: #dc2626; font-weight: bold;">${alert.message}</p>
        <a href="${buildAmazonLink(alert.product.asin)}"
           style="display: inline-block; background: #dc2626; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px;">
          GET DEAL NOW →
        </a>
      </div>
    `;
  }

  private generateFlashSaleText(alert: DealAlert): string {
    return `🔥 FLASH SALE: ${alert.product.title}
${alert.message}
Get Deal: ${buildAmazonLink(alert.product.asin)}`;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private initializeTemplates(): void {
    // Initialize email templates
    this.templates.set("welcome", {
      id: "welcome",
      type: "welcome",
      subject: "Welcome to DXM369 Hardware Intelligence! 🎯",
      htmlContent: `
        <h1>Welcome to DXM369, {{firstName}}!</h1>
        <p>You're now part of the smartest hardware community. Get ready for:</p>
        <ul>
          <li>🎯 Personalized deal alerts with DXM Value Scoring</li>
          <li>📊 Real-time price tracking and trend analysis</li>
          <li>⚡ Flash sale notifications for the best deals</li>
          <li>🔥 Expert buying guides and comparisons</li>
        </ul>
        <p>Your deal alerts are now active. We'll notify you when we find deals that match your preferences.</p>
        <a href="https://dxm369.com" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Explore DXM369 →
        </a>
      `,
      textContent: `Welcome to DXM369, {{firstName}}!

You're now part of the smartest hardware community. Get ready for:
- Personalized deal alerts with DXM Value Scoring
- Real-time price tracking and trend analysis  
- Flash sale notifications for the best deals
- Expert buying guides and comparisons

Your deal alerts are now active. We'll notify you when we find deals that match your preferences.

Visit: https://dxm369.com`,
      variables: ["firstName"]
    });

    // Add more templates...
  }

  // Analytics and stats
  getSubscriberStats() {
    const subscribers = Array.from(this.subscribers.values());
    return {
      total: subscribers.length,
      active: subscribers.filter(s => s.status === "active").length,
      pending: subscribers.filter(s => s.status === "pending").length,
      unsubscribed: subscribers.filter(s => s.status === "unsubscribed").length,
      byFrequency: {
        instant: subscribers.filter(s => s.preferences.frequency === "instant").length,
        daily: subscribers.filter(s => s.preferences.frequency === "daily").length,
        weekly: subscribers.filter(s => s.preferences.frequency === "weekly").length,
      },
      byCategory: {
        gpu: subscribers.filter(s => s.preferences.categories.includes("gpu")).length,
        cpu: subscribers.filter(s => s.preferences.categories.includes("cpu")).length,
        laptop: subscribers.filter(s => s.preferences.categories.includes("laptop")).length,
      }
    };
  }
}

import { emailConfig } from "./env";

// Export singleton instance
export const emailMarketing = new EmailMarketingService({
  provider: "sendgrid", // Can be configured via env vars
  apiKey: emailConfig.sendgridApiKey,
  fromEmail: emailConfig.fromEmail,
  fromName: "DXM369 Hardware Intelligence",
  replyTo: "support@dxm369.com"
});
