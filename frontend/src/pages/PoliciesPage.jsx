import React, { useEffect, useState } from 'react';
import { fetchPolicy, updatePolicy } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Shield, Save, CheckCircle2 } from 'lucide-react';

export default function PoliciesPage() {
  const [policy, setPolicy] = useState(null);
  const [formData, setFormData] = useState({
    maxRetries: 3,
    maxContacts: 2,
    recoveryWindowDays: 7,
    minimumExpectedValue: 50,
    humanEscalationEnabled: true,
    allowedChannels: ['retry', 'payment_link', 'email']
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  const loadPolicy = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPolicy();
      setPolicy(data);
      setFormData({
        maxRetries: data.maxRetries ?? 3,
        maxContacts: data.maxContacts ?? 2,
        recoveryWindowDays: data.recoveryWindowDays ?? 7,
        minimumExpectedValue: data.minimumExpectedValue ?? 50,
        humanEscalationEnabled: data.humanEscalationEnabled ?? true,
        allowedChannels: data.allowedChannels || ['retry', 'payment_link', 'email']
      });
    } catch (err) {
      setError('Failed to fetch merchant policy settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicy();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await updatePolicy(formData);
      setPolicy(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save policy updates.');
    } finally {
      setSaving(false);
    }
  };

  const handleChannelToggle = (channel) => {
    setFormData(prev => {
      const exists = prev.allowedChannels.includes(channel);
      return {
        ...prev,
        allowedChannels: exists
          ? prev.allowedChannels.filter(c => c !== channel)
          : [...prev.allowedChannels, channel]
      };
    });
  };

  if (loading) return <LoadingState message="Fetching merchant policy guardrails..." />;
  if (error) return <ErrorState title="Policy Error" message={error} onRetry={loadPolicy} />;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-['Outfit'] text-white">Merchant Recovery Policies</h2>
          <p className="text-xs text-slate-400">
            Define bounded operational limits and guardrails for automated AI recovery interventions.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Merchant policy guardrails saved successfully!</span>
        </div>
      )}

      {/* Policy Form */}
      <form onSubmit={handleSubmit} className="rounded-xl bg-slate-900/60 border border-slate-800 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Max Retries */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Max Automatic Payment Retries</label>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.maxRetries}
              onChange={(e) => setFormData({ ...formData, maxRetries: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">Maximum retry attempts permitted per failed transaction.</p>
          </div>

          {/* Max Contacts */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Max Customer Contact Messages</label>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.maxContacts}
              onChange={(e) => setFormData({ ...formData, maxContacts: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">Maximum customer communications allowed per recovery case.</p>
          </div>

          {/* Recovery Window Days */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Recovery Window (Days)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={formData.recoveryWindowDays}
              onChange={(e) => setFormData({ ...formData, recoveryWindowDays: parseInt(e.target.value, 10) || 1 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">Maximum duration in days before closing an unrecovered case.</p>
          </div>

          {/* Minimum EV Threshold */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Minimum EV Threshold (₹)</label>
            <input
              type="number"
              min="0"
              value={formData.minimumExpectedValue}
              onChange={(e) => setFormData({ ...formData, minimumExpectedValue: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">Cases below this expected recovery value will be stopped immediately.</p>
          </div>
        </div>

        {/* Human Escalation Toggle */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Human Escalation Queue</h4>
            <p className="text-[11px] text-slate-400">Escalate cases to finance/support team when AI confidence is low.</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, humanEscalationEnabled: !formData.humanEscalationEnabled })}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              formData.humanEscalationEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Allowed Channels */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-200">Allowed Intervention Channels</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            {['retry', 'payment_link', 'email'].map((ch) => (
              <label key={ch} className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowedChannels.includes(ch)}
                  onChange={() => handleChannelToggle(ch)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                />
                <span className="capitalize text-slate-300 font-mono">{ch.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Policy Guardrails'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
