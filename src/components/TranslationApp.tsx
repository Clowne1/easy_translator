'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TextArea from './TextArea';

const TranslationApp: React.FC = () => {
  const [translatedLines, setTranslatedLines] = useState<Array<[string, string]>>([]);
  const [sourceLanguage, setSourceLanguage] = useState<string>('en');
  const [targetLanguage, setTargetLanguage] = useState<string>('zh');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeySaved, setIsApiKeySaved] = useState<boolean>(false);
  const [isApiKeyEditable, setIsApiKeyEditable] = useState<boolean>(true);

  const translate = async (text: string, from: string, to: string) => {
    if (!text.trim()) return '';
    if (!apiKey) {
      throw new Error('请输入并保存API密钥');
    }
    try {
      const options = {
        method: 'POST',
        url: 'https://deep-translate1.p.rapidapi.com/language/translate/v2',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'deep-translate1.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        data: {
          q: text,
          source: from,
          target: to
        }
      };

      const response = await axios.request(options);
      
      if (response.data.data) {
        return response.data.data.translations.translatedText;
      } else {
        throw new Error('翻译失败');
      }
    } catch (error) {
      console.error('翻译出错：', error);
      throw error;
    }
  };

  const handleTranslate = async () => {
    if (isTranslating) return;
    setIsTranslating(true);
    try {
      const newTranslatedLines = await Promise.all(
        translatedLines.map(async ([original, _]) => {
          const translatedLine = await translate(original, sourceLanguage, targetLanguage);
          return [original, translatedLine] as [string, string];
        })
      );
      setTranslatedLines(newTranslatedLines);
    } catch (error) {
      console.error('翻译出错：', error);
      alert(error instanceof Error ? error.message : '翻译出错');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleOriginalTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newOriginalText = e.target.value;
    const newLines = newOriginalText.split('.').map(line => [line, ''] as [string, string]);
    setTranslatedLines(newLines);
  };

  const handleTranslatedTextChange = (index: number, newTranslatedText: string) => {
    setTranslatedLines(prevLines => {
      const newLines = [...prevLines];
      if (newTranslatedText === '') {
        newLines.splice(index, 1);
      } else {
        newLines[index] = [newLines[index][0], newTranslatedText];
      }
      return newLines;
    });
  };

  const handleSourceLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSourceLanguage(e.target.value);
  };

  const handleTargetLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetLanguage(e.target.value);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const handleSaveApiKey = () => {
    if (apiKey) {
      setIsApiKeySaved(true);
      setIsApiKeyEditable(false);
    } else {
      alert('请输入API密钥');
    }
  };

  const handleEditApiKey = () => {
    setIsApiKeyEditable(true);
  };

  useEffect(() => {
    if (translatedLines.some(([_, translated]) => translated === '')) {
      handleTranslate();
    }
  }, [sourceLanguage, targetLanguage]);

  const originalText = translatedLines.map(([original, _]) => original).join('.');

  return (
    <div className="flex flex-col h-screen bg-blue-50">
      <header className="bg-blue-500 text-white p-4">
        <h1 className="text-2xl font-bold">简约翻译编辑器</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 p-4 border-r border-blue-200 flex flex-col">
          <TextArea
            value={originalText}
            onChange={handleOriginalTextChange}
            placeholder="输入原文"
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <select
                className="mr-2 p-2 border rounded bg-white"
                value={sourceLanguage}
                onChange={handleSourceLanguageChange}
              >
                <option value="en">英语</option>
                <option value="zh">中文</option>
                <option value="ja">日语</option>
                <option value="ko">韩语</option>
                <option value="fr">法语</option>
                <option value="de">德语</option>
              </select>
              <span className="mx-2">→</span>
              <select
                className="mr-2 p-2 border rounded bg-white"
                value={targetLanguage}
                onChange={handleTargetLanguageChange}
              >
                <option value="en">英语</option>
                <option value="zh">中文</option>
                <option value="ja">日语</option>
                <option value="ko">韩语</option>
                <option value="fr">法语</option>
                <option value="de">德语</option>
              </select>
            </div>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={handleTranslate}
              disabled={isTranslating}
            >
              {isTranslating ? '翻译中...' : '翻译'}
            </button>
          </div>
          <div className="mt-4 flex items-center">
            <input
              type="text"
              className="flex-grow p-2 border rounded bg-white"
              placeholder="输入API密钥"
              value={apiKey}
              onChange={handleApiKeyChange}
              disabled={!isApiKeyEditable}
            />
            {isApiKeySaved ? (
              <button
                className="ml-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                onClick={handleEditApiKey}
              >
                修改
              </button>
            ) : (
              <button
                className="ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                onClick={handleSaveApiKey}
              >
                保存
              </button>
            )}
          </div>
        </div>
        <div className="w-1/2 p-4 overflow-auto">
          {translatedLines.map(([original, translated], index) => (
            <div key={index} className="mb-4">
              <p className="font-bold text-blue-700">{original}</p>
              <textarea
                className="w-full p-2 border rounded bg-white"
                value={translated}
                onChange={(e) => handleTranslatedTextChange(index, e.target.value)}
                placeholder="翻译结果"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TranslationApp;