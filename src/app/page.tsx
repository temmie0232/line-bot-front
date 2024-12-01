"use client"
import React, { useState, useRef, ChangeEvent, FormEvent, DragEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileIcon, X } from 'lucide-react';

// LINEメッセージとPDFファイルをアップロードするためのコンポーネント
const LineMessageUploader: React.FC = () => {

  const [file, setFile] = useState<File | null>(null);           // アップロードされたファイルを管理
  const [message, setMessage] = useState<string>('');            // テキストメッセージを管理
  const [isLoading, setIsLoading] = useState<boolean>(false);    // 送信中の状態を管理
  const [isDragging, setIsDragging] = useState<boolean>(false);  // ドラッグ状態を管理
  const fileInputRef = useRef<HTMLInputElement>(null);          // ファイル入力要素への参照

  // ページ読み込み時にアラートを表示
  useEffect(() => {
    alert('!! メンテナンス中につき、動作不安定 !!');
  }, []);


  // ファイル選択時のハンドラー
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // アップロードボタンクリック時のハンドラー
  const handleUploadClick = (): void => {
    fileInputRef.current?.click();  // 隠れている実際のファイル入力をクリック
  };

  // ファイル削除時のハンドラー
  const handleRemoveFile = (): void => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';  // 入力フィールドもクリア
    }
  };

  // ドラッグ&ドロップ関連のハンドラー
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // PDFファイルのみを許可
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        alert('PDFファイルのみアップロード可能です。');
      }
    }
  };

  // ファイルサイズを変換 (読みやすいように)
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // フォーム送信時のハンドラー
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      if (message) {
        formData.append('message', message);
      }

      // 本番環境のAPIエンドポイントを使用
      const response = await fetch('https://yokohama-uwu.love/api/send-line-message/', {
        method: 'POST',
        body: formData,
        // credentials: 'include',  // 必要に応じて有効化
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '通信エラーが発生しました' }));
        throw new Error(errorData.message || '送信に失敗しました');
      }

      setFile(null);
      setMessage('');
      alert('送信が完了しました');

    } catch (error) {
      console.error('送信エラー:', error);
      alert(error instanceof Error ? error.message : '送信中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // メインコンテナ
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex flex-col">
      <div className="max-w-4xl mx-auto space-y-8 flex-grow w-full">
        {/* メインカード */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              LINEメッセージ_UPLOADER
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* PDFアップロードセクション */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  PDFアップロード
                </label>
                {/* ファイルが未選択の場合のドロップゾーン表示 */}
                {!file ? (
                  <div
                    onClick={handleUploadClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex justify-center px-6 pt-8 pb-8 border-2 ${isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 border-dashed'
                      } rounded-lg hover:border-gray-400 transition-colors cursor-pointer`}
                  >
                    <div className="space-y-3 text-center">
                      <Upload className={`mx-auto h-16 w-16 ${isDragging ? 'text-blue-500' : 'text-gray-400'
                        }`} />
                      <div className="text-sm text-gray-600">
                        <span className="text-blue-600 hover:text-blue-500 text-base">
                          クリックしてファイルを選択
                        </span>
                        <p className="mt-2">またはドラッグ＆ドロップ</p>
                        {/* 実際のファイル入力フィールド（非表示） */}
                        <input
                          ref={fileInputRef}
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="hidden"
                          accept=".pdf"
                          onChange={handleFileChange}
                        />
                      </div>
                      <p className="text-xs text-gray-500">PDFファイル（10MBまで）</p>
                    </div>
                  </div>
                ) : (
                  // ファイルが選択されている場合のプレビュー表示
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-50 rounded">
                          <FileIcon className="h-8 w-8 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      {/* ファイル削除ボタン */}
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* メッセージ入力セクション */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  メッセージ（任意）
                </label>
                <Textarea
                  value={message}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                  placeholder="メッセージを入力してください..."
                  className="min-h-[120px]"
                />
              </div>

              {/* 送信ボタン */}
              <Button
                type="submit"
                className="w-full py-6 text-lg"
                disabled={!file && !message.trim() || isLoading}  // ファイルもメッセージも空の場合、または送信中は無効
              >
                {isLoading ? '送信中...' : 'LINEグループに送信'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default LineMessageUploader;