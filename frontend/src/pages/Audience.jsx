
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Audience.css";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  city: "",
  state: "",
  language: "English",
  occupation: "",
  organization_department: "",
  preferred_channel: "SMS",
  consent_status: false,
  segment_id: "",
};

const languages = [
  "Hindi", "Kannada", "Tamil", "Telugu", "Marathi",
  "Bengali", "English", "Gujarati", "Malayalam",
  "Punjabi", "Odia", "Urdu",
];

export default function Audience() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ total_audience: 0 });
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  async function loadAudience() {
    setLoading(true);
    setError("");

    try {
      const params = {
        skip: page * pageSize,
        limit: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (language.trim()) params.language = language.trim();
      if (city.trim()) params.city = city.trim();
      if (occupation.trim()) params.occupation = occupation.trim();

      const [listResponse, statsResponse] = await Promise.all([
        api.get("/audience/", { params }),
        api.get("/audience/stats"),
      ]);

      setMembers(listResponse.data.items ?? []);
      setTotal(listResponse.data.total ?? 0);
      setStats(statsResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not load audience members. Please sign in again if needed."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAudience();
  }, [page, search, language, city, occupation]);

  function startAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  }

  function startEdit(member) {
    setForm({
      ...emptyForm,
      ...member,
      age: member.age ?? "",
      segment_id: member.segment_id ?? "",
    });
    setEditingId(member.id);
    setShowForm(true);
    setError("");
  }

  async function saveMember(event) {
    event.preventDefault();
    setError("");

    const payload = {
      ...form,
      age: form.age === "" ? null : Number(form.age),
      segment_id:
        form.segment_id === "" ? null : Number(form.segment_id),
    };

    try {
      if (editingId) {
        await api.put(`/audience/${editingId}`, payload);
      } else {
        await api.post("/audience/", payload);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadAudience();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not save this audience member."
      );
    }
  }

  async function deleteMember(member) {
    if (!window.confirm(`Delete ${member.name}? This cannot be undone.`)) {
      return;
    }

    setError("");
    try {
      await api.delete(`/audience/${member.id}`);
      await loadAudience();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not delete this audience member."
      );
    }
  }

  async function uploadFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const body = new FormData();
    body.append("file", file);
    setError("");
    
try {
  const response = await api.post(
    "/audience/bulk-upload",
    body
  );

  const result = response.data;

  setError("");

  window.alert(
    `Import finished\n` +
    `Rows: ${result.total_rows}\n` +
    `Added: ${result.added}\n` +
    `Failed: ${result.failed_count}`
  );

  if (result.failed_rows?.length) {
    console.table(result.failed_rows);
  }

  // Reload the audience table after upload
  await loadAudience();

  // Reload statistics too, if your page has this function
  if (typeof loadStats === "function") {
    await loadStats();
  }
} catch (err) {
  setError(
    err.response?.data?.detail || "Bulk upload failed."
  );
} finally {
  event.target.value = "";
}
}

  return (
    <main className="audience-page">
      <div className="audience-heading">
        <div>
          <h1>Audience Management</h1>
          <p>Manage your multilingual public awareness audience.</p>
        </div>
        <button onClick={startAdd}>+ Add Audience</button>
      </div>

      <section className="audience-stats">
        <article>
          <span>Total audience</span>
          <strong>{stats.total_audience ?? total}</strong>
        </article>
        <article>
          <span>Languages</span>
          <strong>{stats.by_language?.length ?? 0}</strong>
        </article>
        <article>
          <span>Cities</span>
          <strong>{stats.by_city?.length ?? 0}</strong>
        </article>
      </section>

      {error && <p className="audience-error" role="alert">{error}</p>}

      <section className="audience-toolbar">
        <input
          aria-label="Search audience"
          placeholder="Search name, email, phone or city"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
        />

        <select
          aria-label="Filter by language"
          value={language}
          onChange={(event) => {
            setLanguage(event.target.value);
            setPage(0);
          }}
        >
          <option value="">All languages</option>
          {languages.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <input
          aria-label="Filter by city"
          placeholder="Filter by city"
          value={city}
          onChange={(event) => {
            setCity(event.target.value);
            setPage(0);
          }}
        />

        <input
          aria-label="Filter by occupation"
          placeholder="Filter by occupation"
          value={occupation}
          onChange={(event) => {
            setOccupation(event.target.value);
            setPage(0);
          }}
        />

        <label className="audience-upload">
          Import CSV / Excel
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={uploadFile}
            hidden
          />
        </label>
      </section>

      <section className="audience-table-wrap">
        <table className="audience-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Language</th>
              <th>Channel</th>
              <th>Consent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8">Loading audience...</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan="8">No audience members found.</td></tr>
            ) : (
              members.map((member) => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email || "—"}</td>
                  <td>{member.phone || "—"}</td>
                  <td>{member.city || "—"}</td>
                  <td>{member.language}</td>
                  <td>{member.preferred_channel || "—"}</td>
                  <td>{member.consent_status ? "Yes" : "No"}</td>
                  <td className="audience-actions">
                    <button onClick={() => startEdit(member)}>Edit</button>
                    <button
                      className="delete-button"
                      onClick={() => deleteMember(member)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <div className="audience-pagination">
        <span>
          {total === 0 ? "0 records" : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, total)} of ${total}`}
        </span>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <button
          disabled={(page + 1) * pageSize >= total}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {showForm && (
        <div className="audience-modal-backdrop">
          <section
            className="audience-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="audience-form-title"
          >
            <h2 id="audience-form-title">
              {editingId ? "Edit Audience Member" : "Add Audience Member"}
            </h2>

            <form onSubmit={saveMember}>
              <div className="audience-form-grid">
                <label>
                  Full name *
                  <input
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    value={form.email ?? ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </label>

                <label>
                  Phone
                  <input
                    maxLength={20}
                    value={form.phone ?? ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </label>

                <label>
                  Age
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                  />
                </label>

                <label>
                  Gender
                  <select
                    value={form.gender ?? ""}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="">Prefer not to say</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  City
                  <input
                    value={form.city ?? ""}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </label>

                <label>
                  State
                  <input
                    value={form.state ?? ""}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </label>

                <label>
                  Preferred language *
                  <select
                    required
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                  >
                    {languages.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Occupation
                  <input
                    value={form.occupation ?? ""}
                    onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                  />
                </label>

                <label>
                  Organization / Department
                  <input
                    value={form.organization_department ?? ""}
                    onChange={(e) => setForm({ ...form, organization_department: e.target.value })}
                  />
                </label>

                <label>
                  Preferred channel
                  <select
                    value={form.preferred_channel ?? ""}
                    onChange={(e) => setForm({ ...form, preferred_channel: e.target.value })}
                  >
                    <option value="">Not specified</option>
                    <option>SMS</option>
                    <option>Email</option>
                    <option>WhatsApp</option>
                    <option>Voice</option>
                  </select>
                </label>

                <label className="audience-consent">
                  <input
                    type="checkbox"
                    checked={Boolean(form.consent_status)}
                    onChange={(e) => setForm({ ...form, consent_status: e.target.checked })}
                  />
                  Consent received
                </label>
              </div>

              <div className="audience-modal-actions">
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit">
                  {editingId ? "Save Changes" : "Add Member"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}