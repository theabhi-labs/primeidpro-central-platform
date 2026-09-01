import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Plus,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Laptop
} from 'lucide-react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const AdminAutoUpdate = () => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [version, setVersion] = useState('');
  const [channel, setChannel] = useState('stable');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [minimumVersion, setMinimumVersion] = useState('1.0.0');
  const [isMandatory, setIsMandatory] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { success, error } = useToast();

  const loadReleases = async () => {
    try {
      setLoading(true);
      const res = await adminService.listReleases();
      if (res.success && res.data) {
        setReleases(res.data);
      }
    } catch (err) {
      error('Failed to load release manifests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReleases();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!version || !downloadUrl) return error('Version and Download URL are required');

    setPublishing(true);
    try {
      const res = await adminService.createRelease({
        version,
        channel,
        downloadUrl,
        releaseNotes,
        minimumSupportedVersion: minimumVersion,
        isMandatory
      });

      if (res.success) {
        success(`Release v${version} published successfully!`);
        setModalOpen(false);
        setVersion('');
        setDownloadUrl('');
        setReleaseNotes('');
        loadReleases();
      }
    } catch (err) {
      error('Failed to publish release');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Desktop Client Auto-Updater</h1>
          <p className="text-xs text-slate-400">
            Publish and manage releases for the Prime ID Pro Electron desktop application with mandatory update enforcement.
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)} icon={Plus} variant="primary" size="md">
          Publish New Version
        </Button>
      </div>

      {/* Releases Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Version</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Min. Supported</th>
                <th className="py-3.5 px-4">Mandatory</th>
                <th className="py-3.5 px-4">Release Notes</th>
                <th className="py-3.5 px-4 text-right">Published Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {releases.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-500">
                    No release manifests found.
                  </td>
                </tr>
              ) : (
                releases.map((rel) => (
                  <tr key={rel._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400 text-sm">
                      v{rel.version}
                    </td>
                    <td className="py-3 px-4 uppercase font-semibold text-slate-300">
                      {rel.channel}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      v{rel.minimumSupportedVersion || '1.0.0'}
                    </td>
                    <td className="py-3 px-4">
                      {rel.isMandatory ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                          MANDATORY
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Optional</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200 max-w-sm truncate">
                      {rel.releaseNotes || 'No notes'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(rel.publishedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publish Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Publish Desktop App Update"
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePublish} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Version (SemVer) *</label>
              <input
                type="text"
                required
                placeholder="1.0.1"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Release Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="stable">Stable</option>
                <option value="beta">Beta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Download Executable URL *</label>
            <input
              type="url"
              required
              placeholder="https://primeidpro.online/downloads/PrimeIdPro-Setup-1.0.1.exe"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Release Notes</label>
            <textarea
              rows={3}
              placeholder="Summary of bug fixes, new templates, and performance improvements..."
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800"
              />
              <span>Enforce as Mandatory Update</span>
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={publishing}>
              Publish Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAutoUpdate;
