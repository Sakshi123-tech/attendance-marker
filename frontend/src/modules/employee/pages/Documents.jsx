import React, { useState, useEffect } from 'react';
import { fetchDocuments, downloadDocument } from '../../../api/documentApi';
import { FolderOpen, FileText, Download, FileArchive, Search } from 'lucide-react';
import Button from '../../../components/common/Button';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id) => {
    setDownloadingId(id);
    try {
      await downloadDocument(id);
      // Actual download logic would trigger here (e.g. window.open)
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDocIcon = (type) => {
    switch(type) {
      case 'OFFER_LETTER':
      case 'APPOINTMENT_LETTER': return <FileText className="w-8 h-8 text-indigo-500" />;
      case 'PAYSLIP': return <FileText className="w-8 h-8 text-emerald-500" />;
      case 'CERTIFICATE': return <FileArchive className="w-8 h-8 text-amber-500" />;
      default: return <FileText className="w-8 h-8 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">My Documents</h2>
            <p className="text-sm text-slate-500">Access and download your official company records.</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-24 text-slate-500">Loading documents...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Documents Found</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            {searchQuery ? `No documents match "${searchQuery}".` : "There are currently no documents available in your folder."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map(doc => (
            <div 
              key={doc.id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col transition-all hover:shadow-md hover:border-indigo-200 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                  {getDocIcon(doc.type)}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-100 rounded-md">
                  {doc.type.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 line-clamp-1 mb-1" title={doc.name}>
                  {doc.name}
                </h4>
                <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleDownload(doc.id)}
                  disabled={downloadingId === doc.id}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold text-sm transition-colors border border-slate-200 hover:border-indigo-200 disabled:opacity-50"
                >
                  <Download size={16} className={downloadingId === doc.id ? 'animate-bounce' : ''} />
                  <span>{downloadingId === doc.id ? 'Downloading...' : 'Download'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Documents;
