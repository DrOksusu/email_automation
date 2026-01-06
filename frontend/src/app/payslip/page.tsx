'use client';

import { useState } from 'react';
import { uploadPaySlip, sendEmails, PaySlip, previewEmailTemplate } from '@/lib/api';
import Button from '@/components/Button';
import toast from 'react-hot-toast';
import { Upload, Send, FileText, Mail, AlertCircle, Eye, X } from 'lucide-react';

export default function PaySlipPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    yearMonth: string;
    totalCount: number;
    withEmail: number;
    withoutEmail: number;
    paySlips: PaySlip[];
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResult(null);
      setSelectedIds([]);
    } else {
      toast.error('PDF 파일만 업로드 가능합니다.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadPaySlip(file);
      const data = res.data.data;
      setResult(data);
      const withEmailIds = data.paySlips.filter((p: PaySlip) => p.hasEmail).map((p: PaySlip) => p.id);
      setSelectedIds(withEmailIds);
      toast.success(`${data.totalCount}명의 급여명세서가 파싱되었습니다.`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || '업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && result) {
      setSelectedIds(result.paySlips.filter(p => p.hasEmail).map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: number, hasEmail: boolean) => {
    if (!hasEmail) return;
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSendEmails = async () => {
    if (selectedIds.length === 0) {
      toast.error('발송할 대상을 선택해주세요.');
      return;
    }
    if (!confirm(`${selectedIds.length}명에게 급여명세서를 발송하시겠습니까?`)) return;

    setSending(true);
    try {
      const res = await sendEmails(selectedIds);
      const data = res.data.data;
      toast.success(`발송 완료: ${data.sent}명, 실패: ${data.failed}명`);
      if (data.failed > 0) {
        console.error('발송 실패 목록:', data.errors);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || '발송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handlePreview = async (paySlipId?: number) => {
    setPreviewLoading(true);
    try {
      const res = await previewEmailTemplate(paySlipId);
      setPreviewHtml(res.data.data.html);
    } catch (error: any) {
      toast.error('미리보기를 불러올 수 없습니다.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString('ko-KR');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">급여명세서 업로드 및 발송</h1>
        <Button onClick={() => handlePreview()} variant="secondary">
          <Eye size={16} className="mr-2" />
          템플릿 미리보기
        </Button>
      </div>

      {/* Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                <Mail className="mr-2" size={20} />
                이메일 템플릿 미리보기
              </h2>
              <button
                onClick={() => setPreviewHtml(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              <div
                dangerouslySetInnerHTML={{ __html: previewHtml }}
                className="bg-gray-100"
              />
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
              <p className="text-sm text-gray-500 text-center">
                실제 발송시 각 사원의 급여 정보가 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="mr-2" size={20} />
          PDF 업로드
        </h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">
              {file ? file.name : 'PDF 파일을 선택하세요'}
            </p>
            <p className="text-sm text-gray-400">클릭하여 파일 선택</p>
          </label>
        </div>

        {file && (
          <div className="mt-4 flex justify-end">
            <Button onClick={handleUpload} loading={uploading}>
              <Upload size={16} className="mr-2" />
              파싱 시작
            </Button>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Mail className="mr-2" size={20} />
              파싱 결과: {result.yearMonth}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                총 {result.totalCount}명 |
                이메일 있음: <span className="text-green-600 font-medium">{result.withEmail}명</span> |
                없음: <span className="text-red-600 font-medium">{result.withoutEmail}명</span>
              </span>
              <Button
                onClick={handleSendEmails}
                loading={sending}
                disabled={selectedIds.length === 0}
                variant="success"
              >
                <Send size={16} className="mr-2" />
                선택 발송 ({selectedIds.length}명)
              </Button>
            </div>
          </div>

          {result.withoutEmail > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center text-sm">
              <AlertCircle className="text-yellow-600 mr-2" size={18} />
              <span>이메일이 등록되지 않은 사원이 {result.withoutEmail}명 있습니다. 사원관리에서 이메일을 등록해주세요.</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === result.paySlips.filter(p => p.hasEmail).length && selectedIds.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">사원코드</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">사원명</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">지급액</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">공제액</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">차인지급액</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">미리보기</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.paySlips.map((slip) => (
                  <tr
                    key={slip.id}
                    className={`hover:bg-gray-50 ${!slip.hasEmail ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(slip.id)}
                        onChange={() => handleSelect(slip.id, slip.hasEmail || false)}
                        disabled={!slip.hasEmail}
                        className="rounded disabled:opacity-50"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">{slip.employee.employeeCode}</td>
                    <td className="px-4 py-3 text-sm font-medium">{slip.employee.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {slip.employee.email || <span className="text-red-500">미등록</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{formatNumber(slip.totalPayment)}원</td>
                    <td className="px-4 py-3 text-sm text-right">{formatNumber(slip.totalDeduction)}원</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">
                      {formatNumber(slip.netPayment)}원
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handlePreview(slip.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="미리보기"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
