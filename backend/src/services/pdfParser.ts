import * as fs from 'fs';
import { ParsedPaySlip } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

export async function parsePaySlipPdf(filePath: string): Promise<ParsedPaySlip[]> {
  const dataBuffer = fs.readFileSync(filePath);

  // 페이지별 텍스트 저장
  const pageTexts: string[] = [];

  const options = {
    pagerender: function(pageData: any) {
      return pageData.getTextContent().then(function(textContent: any) {
        let pageText = '';
        for (const item of textContent.items) {
          pageText += item.str;
        }
        pageTexts.push(pageText);
        return pageText;
      });
    }
  };

  await pdfParse(dataBuffer, options);

  console.log('Total pages:', pageTexts.length);

  const paySlips: ParsedPaySlip[] = [];

  for (let i = 0; i < pageTexts.length; i++) {
    const pageText = pageTexts[i];
    const pageNumber = i + 1;

    if (i === 0 || i === pageTexts.length - 1) {
      console.log('\n=== PAGE ' + pageNumber + ' ===');
      console.log(pageText.substring(0, 500));
      console.log('=== END ===\n');
    }

    const paySlip = parsePage(pageText, pageNumber);
    if (paySlip) {
      paySlips.push(paySlip);
    }
  }

  return paySlips;
}

function parsePage(pageText: string, pageNumber: number): ParsedPaySlip | null {
  const yearMonthMatch = pageText.match(/(\d{4})년(\d{1,2})월분/);
  const yearMonth = yearMonthMatch
    ? yearMonthMatch[1] + '-' + yearMonthMatch[2].padStart(2, '0')
    : '';

  const empMatch = pageText.match(/사원코드:(\d+)사원명:([가-힣]+)입사일:([\d-]*)/);
  if (!empMatch) {
    console.log('[' + pageNumber + '] 사원정보 없음');
    return null;
  }

  const employeeCode = empMatch[1];
  const employeeName = empMatch[2];
  const hireDate = empMatch[3] || null;

  const totalsMatch = pageText.match(/지급액계([\d,]+)차인지급액([\d,]+)/);
  const totalPayment = totalsMatch ? parseInt(totalsMatch[1].replace(/,/g, ''), 10) : 0;
  const netPayment = totalsMatch ? parseInt(totalsMatch[2].replace(/,/g, ''), 10) : 0;

  const deductionMatch = pageText.match(/공제액계([\d,]+)/);
  const totalDeduction = deductionMatch ? parseInt(deductionMatch[1].replace(/,/g, ''), 10) : 0;

  const basicSalary = extractNum(pageText, /기본급([\d,]+)/);
  const mealAllowance = extractNum(pageText, /식대([\d,]+)/);
  const overtimePay = extractNum(pageText, /시간외수당([\d,]+)/);
  const incentive = extractNum(pageText, /기타인센티브([\d,]+)/);
  const otherAllowance = extractNum(pageText, /기타수당([\d,]+)/);

  const nationalPension = extractNum(pageText, /국민연금([\d,]+)/);
  const healthInsurance = extractNum(pageText, /건강보험([\d,]+)/);
  const employmentInsurance = extractNum(pageText, /고용보험([\d,]+)/);
  const longTermCare = extractNum(pageText, /장기요양보험료([\d,]+)/);
  const incomeTax = extractNum(pageText, /소득세([\d,]+)/);
  const localIncomeTax = extractNum(pageText, /지방소득세([\d,]+)/);

  console.log('[' + pageNumber + '] ' + employeeName + ': 기본급=' + basicSalary + ', 지급액계=' + totalPayment + ', 차인지급액=' + netPayment);

  return {
    employeeCode,
    employeeName,
    hireDate,
    yearMonth,
    basicSalary,
    mealAllowance,
    overtimePay,
    incentive,
    otherAllowance,
    totalPayment,
    nationalPension,
    healthInsurance,
    employmentInsurance,
    longTermCare,
    incomeTax,
    localIncomeTax,
    totalDeduction,
    netPayment,
    pageNumber
  };
}

function extractNum(text: string, pattern: RegExp): number {
  const match = text.match(pattern);
  return match ? parseInt(match[1].replace(/,/g, ''), 10) || 0 : 0;
}
