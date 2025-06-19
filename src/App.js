import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Link, X, BookOpen, User } from 'lucide-react';

const API_URL = 'http://localhost:4000/api/memos';

const MemoApp = () => {
  const [memos, setMemos] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [newMemoContent, setNewMemoContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [linkingToMemo, setLinkingToMemo] = useState(null);
  const [linkingToBothMemos, setLinkingToBothMemos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailMemo, setDetailMemo] = useState(null);
  const [newMemoType, setNewMemoType] = useState('personal');
  const [newMemoSource, setNewMemoSource] = useState('');
  const [showSourceDetail, setShowSourceDetail] = useState(null);

  const memosPerPage = 2;
  const totalPages = Math.ceil(memos.length / memosPerPage);
  const currentMemos = memos.slice(currentPage * memosPerPage, (currentPage + 1) * memosPerPage);

  // メモ一覧取得
  const fetchMemos = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      // createdAtをDate型に変換
      setMemos(data.map(memo => ({ ...memo, createdAt: new Date(memo.createdAt) })));
    } catch (e) {
      alert('メモの取得に失敗しました');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  // メモ追加
  const addMemo = async () => {
    if (newMemoContent.trim()) {
      const newMemo = {
        id: Date.now(),
        content: newMemoContent,
        createdAt: new Date().toISOString(),
        linkedTo: linkingToBothMemos ? currentMemos.map(m => m.id) : linkingToMemo,
        type: newMemoType,
        ...(newMemoType === 'highlight' && { source: newMemoSource })
      };
      setLoading(true);
      try {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMemo)
        });
        await fetchMemos();
        setNewMemoContent('');
        setNewMemoSource('');
        setShowAddForm(false);
        setLinkingToMemo(null);
        setLinkingToBothMemos(false);
      } catch (e) {
        alert('メモの追加に失敗しました');
      }
      setLoading(false);
    }
  };

  // メモ削除
  const deleteMemo = async (id) => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      await fetchMemos();
      // ページ調整
      const newTotalPages = Math.ceil((memos.length - 1) / memosPerPage);
      if (currentPage >= newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages - 1);
      }
    } catch (e) {
      alert('メモの削除に失敗しました');
    }
    setLoading(false);
  };

  // メモリロード（順序シャッフル）
  const reloadMemos = () => {
    setMemos([...memos].sort(() => Math.random() - 0.5));
    setCurrentPage(0);
  };

  const startLinkingMode = (memoId) => {
    setLinkingToMemo(memoId);
    setLinkingToBothMemos(false);
    setShowAddForm(true);
  };

  const startLinkingBothMode = () => {
    setLinkingToBothMemos(true);
    setLinkingToMemo(null);
    setShowAddForm(true);
  };

  const getLinkedMemo = (linkedToId) => {
    return memos.find(memo => memo.id === linkedToId);
  };

  const getLinkedMemos = (linkedToIds) => {
    if (Array.isArray(linkedToIds)) {
      return linkedToIds.map(id => memos.find(memo => memo.id === id)).filter(Boolean);
    }
    return linkedToIds ? [getLinkedMemo(linkedToIds)] : [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">メモアプリ</h1>
        {loading && <div className="text-center text-gray-500 mb-4">Loading...</div>}
        {/* メモ表示エリア */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {currentMemos.map((memo) => (
            <div
              key={memo.id}
              className={`bg-white rounded-lg shadow-lg p-6 border-l-4 hover:shadow-xl transition-shadow ${
                memo.type === 'highlight'
                  ? 'border-yellow-400'
                  : 'border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2 text-sm">
                  {memo.type === 'highlight' ? (
                    <span className="flex items-center text-yellow-600 font-bold"><BookOpen size={16} className="mr-1" />引用</span>
                  ) : (
                    <span className="flex items-center text-blue-600 font-bold"><User size={16} className="mr-1" />自分</span>
                  )}
                  <span className="text-gray-500">{memo.createdAt.toLocaleString('ja-JP')}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startLinkingMode(memo.id)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    title="このメモにリンクした新しいメモを作成"
                  >
                    <Link size={16} />
                  </button>
                  <button
                    onClick={() => deleteMemo(memo.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="メモを削除"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className={`text-gray-800 mb-3 whitespace-pre-wrap ${memo.type === 'highlight' ? 'bg-yellow-50 border-l-4 border-yellow-300 p-2 rounded' : ''}`}>
                {memo.content}
                {memo.type === 'highlight' && memo.source && (
                  <div className="mt-2 text-xs text-yellow-700 italic">
                    <span className="font-bold">引用元: </span>
                    <span
                      className="underline cursor-pointer hover:text-yellow-900"
                      onClick={e => { e.stopPropagation(); setShowSourceDetail(memo); }}
                      title="引用元の詳細を見る"
                    >
                      {memo.source.split('（')[0]}
                    </span>
                  </div>
                )}
              </div>
              {memo.linkedTo && (
                <div className="mt-3 p-2 bg-gray-50 rounded border-l-2 border-gray-300">
                  <div className="text-xs text-gray-500 mb-1">
                    {Array.isArray(memo.linkedTo) ? 'リンク元メモ（複数）:' : 'リンク元メモ:'}
                  </div>
                  {getLinkedMemos(memo.linkedTo).map((linkedMemo, index) => (
                    <div
                      key={linkedMemo?.id || index}
                      className="text-sm text-blue-700 mb-1 cursor-pointer hover:underline"
                      onClick={() => linkedMemo && setDetailMemo(linkedMemo)}
                      title="詳細を見る"
                    >
                      {linkedMemo?.content || '削除されたメモ'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 表示中の2つのメモをリンクするボタン */}
        {currentMemos.length === 2 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={startLinkingBothMode}
              className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors shadow-lg"
            >
              <Link size={20} />
              <span>この2つのメモをリンクした新しいメモを作成</span>
            </button>
          </div>
        )}

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mb-8">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`px-3 py-1 rounded ${
                  currentPage === i
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-blue-500 border border-blue-500 hover:bg-blue-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* リロードボタン */}
        <div className="flex justify-center mb-8">
          <button
            onClick={reloadMemos}
            className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-lg"
          >
            <RefreshCw size={20} />
            <span>メモをリロード</span>
          </button>
        </div>

        {/* メモ追加フォーム */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {linkingToBothMemos ? '2つのメモをリンクした新しいメモを追加' : 
                 linkingToMemo ? 'リンク付きメモを追加' : '新しいメモを追加'}
              </h3>
              {/* メモ種類選択 */}
              <div className="mb-4 flex space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="memoType"
                    value="personal"
                    checked={newMemoType === 'personal'}
                    onChange={() => setNewMemoType('personal')}
                    className="mr-2"
                  />
                  <User size={16} className="mr-1 text-blue-600" />自分
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="memoType"
                    value="highlight"
                    checked={newMemoType === 'highlight'}
                    onChange={() => setNewMemoType('highlight')}
                    className="mr-2"
                  />
                  <BookOpen size={16} className="mr-1 text-yellow-600" />引用
                </label>
              </div>
              {/* 引用元入力欄 */}
              {newMemoType === 'highlight' && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={newMemoSource}
                    onChange={e => setNewMemoSource(e.target.value)}
                    placeholder="引用元（書籍名や著者など）"
                    className="w-full p-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              )}
              
              {linkingToBothMemos && (
                <div className="mb-4 space-y-2">
                  <div className="text-sm text-purple-600 mb-2">リンク元メモ（2つ）:</div>
                  {currentMemos.map((memo, index) => (
                    <div key={memo.id} className="p-2 bg-purple-50 rounded border-l-4 border-purple-400">
                      <div className="text-xs text-purple-600 mb-1">メモ {index + 1}:</div>
                      <div className="text-sm text-gray-700">{memo.content}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {linkingToMemo && !linkingToBothMemos && (
                <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <div className="text-sm text-blue-600 mb-1">リンク元メモ:</div>
                  <div className="text-sm text-gray-700">
                    {getLinkedMemo(linkingToMemo)?.content}
                  </div>
                </div>
              )}
              
              <textarea
                value={newMemoContent}
                onChange={(e) => setNewMemoContent(e.target.value)}
                placeholder="メモの内容を入力してください..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewMemoContent('');
                    setNewMemoSource('');
                    setLinkingToMemo(null);
                    setLinkingToBothMemos(false);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={addMemo}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 右下の追加ボタン */}
        <button
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors hover:scale-110 transform"
        >
          <Plus size={24} />
        </button>

        {/* メモ詳細モーダル */}
        {detailMemo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
              <button
                onClick={() => setDetailMemo(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                title="閉じる"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold mb-4">メモ詳細</h2>
              <div className="mb-2 flex items-center space-x-2 text-sm">
                {detailMemo.type === 'highlight' ? (
                  <span className="flex items-center text-yellow-600 font-bold"><BookOpen size={16} className="mr-1" />引用</span>
                ) : (
                  <span className="flex items-center text-blue-600 font-bold"><User size={16} className="mr-1" />自分</span>
                )}
                <span className="text-gray-500">作成日時: {detailMemo.createdAt.toLocaleString('ja-JP')}</span>
              </div>
              <div className={`mb-4 text-gray-800 whitespace-pre-wrap ${detailMemo.type === 'highlight' ? 'bg-yellow-50 border-l-4 border-yellow-300 p-2 rounded' : ''}`}>
                {detailMemo.content}
                {detailMemo.type === 'highlight' && detailMemo.source && (
                  <div className="mt-2 text-xs text-yellow-700 italic">
                    <span className="font-bold">引用元: </span>{detailMemo.source}
                  </div>
                )}
              </div>
              {detailMemo.linkedTo && (
                <div className="mt-3 p-2 bg-gray-50 rounded border-l-2 border-gray-300">
                  <div className="text-xs text-gray-500 mb-1">
                    {Array.isArray(detailMemo.linkedTo) ? 'リンク元メモ（複数）:' : 'リンク元メモ:'}
                  </div>
                  {getLinkedMemos(detailMemo.linkedTo).map((linkedMemo, index) => (
                    <div
                      key={linkedMemo?.id || index}
                      className="text-sm text-blue-700 mb-1 cursor-pointer hover:underline"
                      onClick={() => linkedMemo && setDetailMemo(linkedMemo)}
                      title="詳細を見る"
                    >
                      {linkedMemo?.content || '削除されたメモ'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 引用元詳細モーダル */}
        {showSourceDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-xs mx-4 relative">
              <button
                onClick={() => setShowSourceDetail(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                title="閉じる"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-bold mb-4">引用元の詳細</h2>
              <div className="text-yellow-800 text-sm whitespace-pre-wrap">{showSourceDetail.source}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoApp; 