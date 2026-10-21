
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Campaigns.css";

const campaignTypes = [
  "Awareness",
  "Emergency Alert",
  "Educational",
  "Organizational Announcement",
];

const statuses = [
  "Draft",
  "In Review",
  "Approved",
  "Scheduled",
  "Running",
  "Completed",
  "Failed",
];

const emptyForm = {
  name: "",
  description: "",
  campaign_type: "Awareness",
  objective: "",
  target_segments: [],
  channels: ["SMS"],
  start_date: "",
  end_date: "",
  priority: "Normal",
  status: "Draft",
};

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCampaigns() {
    try {
      const response = await api.get("/campaigns/", {
        params: {
          search: search || undefined,
          status: filterStatus || undefined,
          limit: 100,
        },
      });
      setCampaigns(response.data.items || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not load campaigns.");
    }
  }

  async function loadSegments() {
    try {
      const response = await api.get("/segments/");
      setSegments(response.data.items || response.data || []);
    } catch {
      setSegments([]);
    }
  }

  useEffect(() => {
    loadSegments();
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [search, filterStatus]);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
      ...(field === "campaign_type" && value === "Emergency Alert"
        ? { priority: "High" }
        : {}),
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function editCampaign(campaign) {
    setForm({
      ...emptyForm,
      ...campaign,
      target_segments: campaign.target_segments || [],
      channels: campaign.channels || [],
      start_date: campaign.start_date
        ? campaign.start_date.slice(0, 16)
        : "",
      end_date: campaign.end_date
        ? campaign.end_date.slice(0, 16)
        : "",
    });
    setEditingId(campaign.id);
    setShowForm(true);
    setError("");
    setMessage("");
  }

  async function saveCampaign(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const payload = {
      ...form,
      start_date: form.start_date
        ? new Date(form.start_date).toISOString()
        : null,
      end_date: form.end_date
        ? new Date(form.end_date).toISOString()
        : null,
      priority:
        form.campaign_type === "Emergency Alert"
          ? "High"
          : form.priority,
    };

    try {
      if (editingId) {
        await api.put(`/campaigns/${editingId}`, payload);
        setMessage("Campaign updated successfully.");
      } else {
        await api.post("/campaigns/", payload);
        setMessage("Campaign created successfully.");
      }

      resetForm();
      await loadCampaigns();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save campaign.");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(campaignId, newStatus) {
    try {
      await api.patch(
        `/campaigns/${campaignId}/status`,
        null,
        { params: { new_status: newStatus } }
      );
      setMessage("Campaign status updated.");
      await loadCampaigns();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not update status.");
    }
  }

  async function cloneCampaign(campaignId) {
    try {
      await api.post(`/campaigns/${campaignId}/clone`);
      setMessage("Campaign cloned successfully.");
      await loadCampaigns();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not clone campaign.");
    }
  }

  async function deleteCampaign(campaignId) {
    if (!window.confirm("Are you sure you want to delete this campaign?")) {
      return;
    }

    try {
      await api.delete(`/campaigns/${campaignId}`);
      setMessage("Campaign deleted successfully.");
      await loadCampaigns();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not delete campaign.");
    }
  }

  function toggleChannel(channel) {
    setForm((previous) => ({
      ...previous,
      channels: previous.channels.includes(channel)
        ? previous.channels.filter((item) => item !== channel)
        : [...previous.channels, channel],
    }));
  }

  function toggleSegment(segmentId) {
    setForm((previous) => ({
      ...previous,
      target_segments: previous.target_segments.includes(segmentId)
        ? previous.target_segments.filter((id) => id !== segmentId)
        : [...previous.target_segments, segmentId],
    }));
  }

  return (
    <main className="campaigns-page">
      <div className="campaigns-heading">
        <div>
          <p className="campaigns-eyebrow">COMMUNICATION WORKSPACE</p>
          <h1>Campaigns</h1>
          <p>Create, organize, and track awareness campaigns.</p>
        </div>
        <button
          className="campaign-primary-btn"
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
            setError("");
            setMessage("");
          }}
        >
          + Create Campaign
        </button>
      </div>

      {message && <div className="campaign-message">{message}</div>}
      {error && <div className="campaign-error">{error}</div>}

      <section className="campaign-summary">
        <article>
          <span>Total campaigns</span>
          <strong>{campaigns.length}</strong>
        </article>
        <article>
          <span>Running</span>
          <strong>
            {campaigns.filter((item) => item.status === "Running").length}
          </strong>
        </article>
        <article>
          <span>Drafts</span>
          <strong>
            {campaigns.filter((item) => item.status === "Draft").length}
          </strong>
        </article>
        <article>
          <span>Emergency alerts</span>
          <strong>
            {campaigns.filter(
              (item) => item.campaign_type === "Emergency Alert"
            ).length}
          </strong>
        </article>
      </section>

      {showForm && (
        <section className="campaign-form-card">
          <h2>{editingId ? "Edit Campaign" : "Create Campaign"}</h2>

          <form onSubmit={saveCampaign}>
            <label>
              Campaign name *
              <input
                required
                maxLength={150}
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="e.g. Community Health Awareness"
              />
            </label>

            <label>
              Campaign type *
              <select
                value={form.campaign_type}
                onChange={(event) =>
                  updateField("campaign_type", event.target.value)
                }
              >
                {campaignTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>

            <label>
              Objective
              <textarea
                rows={3}
                value={form.objective || ""}
                onChange={(event) => updateField("objective", event.target.value)}
                placeholder="What should this campaign achieve?"
              />
            </label>

            <label>
              Description
              <textarea
                rows={3}
                value={form.description || ""}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Describe the campaign"
              />
            </label>

            <fieldset>
              <legend>Target segments</legend>
              {segments.length === 0 ? (
                <p>No segments found. You can create segments on the Segments page.</p>
              ) : (
                segments.map((segment) => (
                  <label className="campaign-check" key={segment.id}>
                    <input
                      type="checkbox"
                      checked={form.target_segments.includes(segment.id)}
                      onChange={() => toggleSegment(segment.id)}
                    />
                    {segment.name}
                  </label>
                ))
              )}
            </fieldset>

            <fieldset>
              <legend>Channels</legend>
              {["SMS", "Email", "WhatsApp", "Web", "Social Media"].map(
                (channel) => (
                  <label className="campaign-check" key={channel}>
                    <input
                      type="checkbox"
                      checked={form.channels.includes(channel)}
                      onChange={() => toggleChannel(channel)}
                    />
                    {channel}
                  </label>
                )
              )}
            </fieldset>

            <div className="campaign-form-grid">
              <label>
                Start date
                <input
                  type="datetime-local"
                  value={form.start_date || ""}
                  onChange={(event) => updateField("start_date", event.target.value)}
                />
              </label>

              <label>
                End date
                <input
                  type="datetime-local"
                  value={form.end_date || ""}
                  min={form.start_date || undefined}
                  onChange={(event) => updateField("end_date", event.target.value)}
                />
              </label>

              <label>
                Priority
                <select
                  value={form.campaign_type === "Emergency Alert" ? "High" : form.priority}
                  disabled={form.campaign_type === "Emergency Alert"}
                  onChange={(event) => updateField("priority", event.target.value)}
                >
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                </select>
                {form.campaign_type === "Emergency Alert" && (
                  <small>Emergency campaigns always use High priority.</small>
                )}
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value)}
                >
                  {statuses.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="campaign-form-actions">
              <button className="campaign-primary-btn" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Save Changes" : "Create Campaign"}
              </button>
              <button type="button" className="campaign-secondary-btn" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="campaign-list-card">
        <div className="campaign-list-heading">
          <h2>All Campaigns</h2>
          <div className="campaign-filters">
            <input
              aria-label="Search campaigns"
              placeholder="Search campaigns..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              aria-label="Filter by status"
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="campaign-empty">
            <h3>No campaigns found</h3>
            <p>Create your first campaign to get started.</p>
          </div>
        ) : (
          <div className="campaign-table-wrapper">
            <table className="campaign-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Channels</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>
                      <strong>{campaign.name}</strong>
                      <small>{campaign.objective || campaign.description || "No objective provided"}</small>
                    </td>
                    <td>{campaign.campaign_type}</td>
                    <td>
                      <span className={`campaign-priority priority-${(campaign.priority || "Normal").toLowerCase()}`}>
                        {campaign.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`campaign-status status-${(campaign.status || "Draft").toLowerCase().replaceAll(" ", "-")}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td>{(campaign.channels || []).join(", ") || "—"}</td>
                    <td>
                      <div className="campaign-row-actions">
                        <button onClick={() => editCampaign(campaign)}>Edit</button>
                        <button onClick={() => cloneCampaign(campaign.id)}>Clone</button>
                        <button
                          className="campaign-delete-btn"
                          onClick={() => deleteCampaign(campaign.id)}
                        >
                          Delete
                        </button>
                        <select
                          aria-label={`Change status for ${campaign.name}`}
                          value={campaign.status}
                          onChange={(event) =>
                            changeStatus(campaign.id, event.target.value)
                          }
                        >
                          {statuses.map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Campaigns;
