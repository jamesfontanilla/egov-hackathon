import axios from 'axios';
import { config } from '../config/env.js';
import { db } from '../db/connection.js';

interface SendSmsParams {
  number: string; // E.164 format: +639XXXXXXXXX
  message: string;
}

export class EmessageService {
  private baseUrl = config.emessage.baseUrl;

  async sendSms(params: SendSmsParams): Promise<{ success: boolean; statusCode: number }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messaging/v1/sms/push`,
        { number: params.number, message: params.message },
        {
          headers: {
            'X-EMESSAGE-Auth': config.emessage.apiToken,
            'Content-Type': 'application/json',
          },
        }
      );
      return { success: true, statusCode: response.status };
    } catch (error: any) {
      return { success: false, statusCode: error.response?.status || 500 };
    }
  }

  async sendAndLog(params: {
    recipientUserId?: string;
    recipientMobile: string;
    messageBody: string;
    triggerEvent: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }): Promise<void> {
    const result = await this.sendSms({
      number: params.recipientMobile,
      message: params.messageBody,
    });

    await db('notification_logs').insert({
      recipient_user_id: params.recipientUserId,
      recipient_mobile: params.recipientMobile,
      message_body: params.messageBody,
      trigger_event: params.triggerEvent,
      related_entity_type: params.relatedEntityType,
      related_entity_id: params.relatedEntityId,
      emessage_status_code: result.statusCode,
      emessage_response: JSON.stringify({ success: result.success }),
    });
  }
}

export const emessageService = new EmessageService();

// Notification templates
export const notifications = {
  budgetSubmitted(barangayName: string, fiscalYear: number, budgetId: string) {
    return `[ePondo] Brgy. ${barangayName} has submitted FY${fiscalYear} budget for review. Ref: ${budgetId.slice(0, 8)}`;
  },
  budgetApproved(fiscalYear: number) {
    return `[ePondo] Your FY${fiscalYear} budget has been approved. Disbursements are now enabled.`;
  },
  budgetRejected(fiscalYear: number, reason: string) {
    return `[ePondo] Your FY${fiscalYear} budget was returned for revision. Reason: ${reason}`;
  },
  largeDisbursement(amount: number, payee: string, voucher: string) {
    return `[ePondo] Disbursement of PHP${amount.toLocaleString()} to ${payee} pending your review. Ref: ${voucher}`;
  },
  projectStarted(projectName: string) {
    return `[ePondo] Project "${projectName}" has started in your barangay.`;
  },
};
