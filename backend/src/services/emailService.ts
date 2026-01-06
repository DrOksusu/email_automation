import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  htmlBody: string;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const { to, subject, htmlBody } = params;

  try {
    await transporter.sendMail({
      from: `"급여명세서 시스템" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: htmlBody,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

export function generatePaySlipEmailHtml(paySlip: any, employee: any): string {
  const formatNumber = (num: number) => num.toLocaleString('ko-KR');
  const logoUrl = process.env.FRONTEND_URL + '/logo.png';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding: 20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px;">
              <!-- Logo & Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
                  <img src="${logoUrl}" alt="Company Logo" style="max-width: 240px; max-height: 120px; margin-bottom: 15px;" />
                  <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: bold; letter-spacing: -0.5px;">${paySlip.yearMonth}</h1>
                  <p style="margin: 8px 0 0 0; color: #a3c4e8; font-size: 16px; font-weight: 500;">급여명세서</p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="background-color: #ffffff;">
                  <!-- Employee Info -->
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding: 25px;">
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; overflow: hidden;">
                          <tr>
                            <td style="padding: 20px;">
                              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                  <td width="50%" style="padding: 8px 0;">
                                    <span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">사원코드</span>
                                    <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 16px; font-weight: 700;">${employee.employeeCode}</p>
                                  </td>
                                  <td width="50%" style="padding: 8px 0; text-align: right;">
                                    <span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">사원명</span>
                                    <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 16px; font-weight: 700;">${employee.name}</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Payment Section -->
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding: 0 25px 25px 25px;">
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);">
                          <tr>
                            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 14px 20px;">
                              <span style="color: #ffffff; font-size: 15px; font-weight: 700;">💰 지급 내역</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="background-color: #ffffff; border: 1px solid #e2e8f0; border-top: none;">
                              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr style="background-color: #f0fdf4;">
                                  <td style="padding: 14px 20px; color: #374151; font-size: 14px;">기본급</td>
                                  <td style="padding: 14px 20px; text-align: right; color: #1e293b; font-weight: 600; font-size: 14px;">${formatNumber(paySlip.basicSalary)}원</td>
                                </tr>
                                <tr style="background-color: #ffffff;">
                                  <td style="padding: 14px 20px; color: #374151; font-size: 14px; border-top: 1px solid #f0f0f0;">식대</td>
                                  <td style="padding: 14px 20px; text-align: right; color: #1e293b; font-weight: 600; font-size: 14px; border-top: 1px solid #f0f0f0;">${formatNumber(paySlip.mealAllowance)}원</td>
                                </tr>
                                <tr style="background-color: #f0fdf4;">
                                  <td style="padding: 14px 20px; color: #374151; font-size: 14px; border-top: 1px solid #f0f0f0;">시간외수당</td>
                                  <td style="padding: 14px 20px; text-align: right; color: #1e293b; font-weight: 600; font-size: 14px; border-top: 1px solid #f0f0f0;">${formatNumber(paySlip.overtimePay)}원</td>
                                </tr>
                                <tr style="background-color: #ffffff;">
                                  <td style="padding: 14px 20px; color: #374151; font-size: 14px; border-top: 1px solid #f0f0f0;">기타인센티브</td>
                                  <td style="padding: 14px 20px; text-align: right; color: #1e293b; font-weight: 600; font-size: 14px; border-top: 1px solid #f0f0f0;">${formatNumber(paySlip.incentive)}원</td>
                                </tr>
                                <tr style="background-color: #f0fdf4;">
                                  <td style="padding: 14px 20px; color: #374151; font-size: 14px; border-top: 1px solid #f0f0f0;">기타수당</td>
                                  <td style="padding: 14px 20px; text-align: right; color: #1e293b; font-weight: 600; font-size: 14px; border-top: 1px solid #f0f0f0;">${formatNumber(paySlip.otherAllowance)}원</td>
                                </tr>
                                <tr style="background-color: #dcfce7;">
                                  <td style="padding: 16px 20px; color: #166534; font-weight: 700; font-size: 15px; border-top: 2px solid #22c55e;">지급액 계</td>
                                  <td style="padding: 16px 20px; text-align: right; color: #166534; font-weight: 700; font-size: 17px; border-top: 2px solid #22c55e;">${formatNumber(paySlip.totalPayment)}원</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Deduction Section -->
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding: 0 25px 25px 25px;">
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15);">
                          <tr>
                            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 14px 20px;">
                              <span style="color: #ffffff; font-size: 15px; font-weight: 700;">📋 공제 내역</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="background-color: #ffffff; border: 1px solid #e2e8f0; border-top: none;">
                              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr style="background-color: #fef2f2;">
                                  <td style="padding: 14px 20px; color: #374151; font-size: 14px;">국민연금</td>
                                  <td style="padding: 14px 20px; text-align: right; color: #1e293b; font-weight: 600; font-size: 14px;">${formatNumber(paySlip.nationalPension)}원</td>
                                </tr>
                                <tr style="background-color: #ffffff;">
                                  <td style="padding: 14px 20px; color: #374151; font-size: 14px; border-top: 1px solid #f0f0f0;">건강보험</td>
                                  <td style="padding: 14px 20px; text-align: right; color: #1e293b; font-weight: 600; font-size: 14px; border-top: 1px solid #f0f0f0;">${formatNumber(paySlip.healthInsurance)}원</td>
                                </tr>
                                <tr style="background-color: #fef2f2;">
                                  <td style="padding: 14px 20px; color: #374151; font-size: 14px; border-top: 1px solid #f0f0f0;">고용보험</td>
                                  <td style="padding: 14px 20px; text-align: right; color: #1e293b; font-weight: 600; font-size: 14px; border-top: 1px solid #f0f0f0;">${formatNumber(paySlip.employmentInsurance)}원</td>
                                </tr>
                                <tr style="background-color: #ffffff;">
                                  <td style="padding: 14px 20px; color: #374151; font-size: 14px; border-top: 1px solid #f0f0f0;">장기요양보험료</td>
                                  <td style="padding: 14px 20px; text-align: right; color: #1e293b; font-weight: 600; font-size: 14px; border-top: 1px solid #f0f0f0;">${formatNumber(paySlip.longTermCare)}원</td>
                                </tr>
                                <tr style="background-color: #fef2f2;">
                                  <td style="padding: 14px 20px; color: #374151; font-size: 14px; border-top: 1px solid #f0f0f0;">소득세</td>
                                  <td style="padding: 14px 20px; text-align: right; color: #1e293b; font-weight: 600; font-size: 14px; border-top: 1px solid #f0f0f0;">${formatNumber(paySlip.incomeTax)}원</td>
                                </tr>
                                <tr style="background-color: #ffffff;">
                                  <td style="padding: 14px 20px; color: #374151; font-size: 14px; border-top: 1px solid #f0f0f0;">지방소득세</td>
                                  <td style="padding: 14px 20px; text-align: right; color: #1e293b; font-weight: 600; font-size: 14px; border-top: 1px solid #f0f0f0;">${formatNumber(paySlip.localIncomeTax)}원</td>
                                </tr>
                                <tr style="background-color: #fee2e2;">
                                  <td style="padding: 16px 20px; color: #dc2626; font-weight: 700; font-size: 15px; border-top: 2px solid #ef4444;">공제액 계</td>
                                  <td style="padding: 16px 20px; text-align: right; color: #dc2626; font-weight: 700; font-size: 17px; border-top: 2px solid #ef4444;">${formatNumber(paySlip.totalDeduction)}원</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Net Payment -->
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding: 0 25px 30px 25px;">
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); border-radius: 16px; box-shadow: 0 4px 20px rgba(30, 58, 95, 0.3);">
                          <tr>
                            <td style="padding: 30px; text-align: center;">
                              <p style="margin: 0 0 8px 0; color: #a3c4e8; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px;">실수령액</p>
                              <p style="margin: 0; color: #ffffff; font-size: 42px; font-weight: 800; letter-spacing: -1px;">${formatNumber(paySlip.netPayment)}<span style="font-size: 24px; font-weight: 600;">원</span></p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; border-radius: 0 0 16px 16px; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">본 메일은 자동 발송되었습니다.</p>
                  <p style="margin: 0; color: #94a3b8; font-size: 12px;">문의사항은 인사팀으로 연락 바랍니다.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendPaySlipEmail(paySlipId: number): Promise<{ success: boolean; error?: string }> {
  const paySlip = await prisma.paySlip.findUnique({
    where: { id: paySlipId },
    include: { employee: true }
  });

  if (!paySlip) {
    return { success: false, error: '급여명세서를 찾을 수 없습니다.' };
  }

  if (!paySlip.employee.email) {
    return { success: false, error: '이메일 주소가 등록되지 않았습니다.' };
  }

  const emailLog = await prisma.emailLog.create({
    data: {
      paySlipId,
      recipientEmail: paySlip.employee.email,
      subject: `[${paySlip.yearMonth}] 급여명세서 안내`,
      status: 'pending'
    }
  });

  try {
    const htmlBody = generatePaySlipEmailHtml(paySlip, paySlip.employee);

    await sendEmail({
      to: paySlip.employee.email,
      subject: `[${paySlip.yearMonth}] 급여명세서 안내`,
      htmlBody
    });

    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'sent', sentAt: new Date() }
    });

    return { success: true };
  } catch (error: any) {
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'failed', errorMessage: error.message }
    });

    return { success: false, error: error.message };
  }
}
