
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Segments.css";

const fields = [
  { value: "age", label: "Age" },
  { value: "gender", label: "Gender" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "language", label: "Language" },
  { value: "occupation", label: "Occupation" },
  { value: "organization_department", label: "Department" },
  { value: "preferred_channel", label: "Preferred channel" },
  { value: "consent_status", label: "Consent status" },
];

const operators = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Does not equal" },
  { value: "contains", label: "Contains" },
  { value: "greater_than", label: "Greater than" },
  { value: "greater_than_or_equal", label: "At least" },
  { value: "less_than", label: "Less than" },
  { value: "less_than_or_equal", label: "At most" },
  { value: "is_empty", label: "Is empty" },
  { value: "is_not_empty", label: "Is not empty" },
];

const newRule = () => ({
  field: "language",
  operator: "equals",
  value: "",
});

const emptyRules = () => ({
  combination: "AND",
  rules: [newRule()],
});

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [rules, setRules] = useState(emptyRules);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState(null);
  const [members, setMembers] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadSegments() {
    try {
      const response = await api.get("/segments/");
      setSegments(response.data.items ?? []);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not load segments.");
    }
  }

  useEffect(() => {
    loadSegments();
  }, []);

  function updateRule(index, key, value) {
    setRules((current) => ({
      ...current,
      rules: current.rules.map((rule, i) =>
        i === index ? { ...rule, [key]: value } : rule
      ),
    }));
    setPreview(null);
  }

  function addRule() {
    setRules((current) => ({
      ...current,
      rules: [...current.rules, newRule()],
    }));
    setPreview(null);
  }

  function removeRule(index) {
    setRules((current) => ({
      ...current,
      rules: current.rules.filter((_, i) => i !== index),
    }));
    setPreview(null);
  }

  function resetForm() {
    setName("");
    setDescription("");
    setRules(emptyRules());
    setEditingId(null);
    setPreview(null);
    setError("");
    setMessage("");
  }

  async function handlePreview() {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/segments/preview", {
        filter_rules: rules,
        limit: 10,
      });
      setPreview(response.data);
      setMembers(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Preview failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Enter a segment name.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        language:
          rules.rules.find((rule) => rule.field === "language")?.value || null,
        filter_rules: rules,
      };

     if (editingId) {
        console.log("Editing segment ID:", editingId);
        console.log("API base URL:", api.defaults.baseURL);
        console.log("Expected URL:", `${api.defaults.baseURL}/segments/${editingId}`);

        await api.put(`/segments/${editingId}`, payload);
        setMessage("Segment updated successfully.");
    } else {
        await api.post("/segments/", payload);
        setMessage("Segment saved successfully.");
      }

      await loadSegments();
      setEditingId(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save segment.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(segment) {
    setName(segment.name);
    setDescription(segment.description || "");
    setRules(segment.filter_rules || emptyRules());
    setEditingId(segment.id);
    setPreview(null);
    setMembers(null);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(segment) {
    if (!window.confirm(`Delete the segment "${segment.name}"?`)) return;

    try {
      await api.delete(`/segments/${segment.id}`);
      setMessage("Segment deleted.");
      await loadSegments();
      if (editingId === segment.id) resetForm();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not delete segment.");
    }
  }

  async function handleViewMembers(segment) {
    setError("");
    setMembers(null);

    try {
      const response = await api.get(`/segments/${segment.id}/members`, {
        params: { skip: 0, limit: 10 },
      });
      setMembers({ ...response.data, segmentName: segment.name });
    } catch (err) {
      setError(err.response?.data?.detail || "Could not load segment members.");
    }
  }

  return (
    <main className="segments-page">
      <header className="segments-heading">
        <div>
          <p className="segments-eyebrow">AUDIENCE MANAGEMENT</p>
          <h1>Audience Segments</h1>
          <p>Create targeted groups using flexible audience rules.</p>
        </div>
        <button type="button" className="segment-secondary" onClick={resetForm}>
          New segment
        </button>
      </header>

      {error && <div className="segment-alert error">{error}</div>}
      {message && <div className="segment-alert success">{message}</div>}

      <section className="segment-panel">
        <div className="segment-panel-title">
          <div>
            <h2>{editingId ? "Edit segment" : "Segment builder"}</h2>
            <p>Define the audience you want to reach.</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="segment-form-grid">
            <label>
              Segment name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Telugu-speaking audience"
                maxLength={100}
                required
              />
            </label>

            <label>
              Description
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe this audience group"
              />
            </label>
          </div>

          <div className="segment-rule-heading">
            <h3>Rules</h3>
            <label className="combination-select">
              Match rules
              <select
                value={rules.combination}
                onChange={(event) => {
                  setRules((current) => ({
                    ...current,
                    combination: event.target.value,
                  }));
                  setPreview(null);
                }}
              >
                <option value="AND">All rules (AND)</option>
                <option value="OR">Any rule (OR)</option>
              </select>
            </label>
          </div>

          <div className="segment-rules">
            {rules.rules.map((rule, index) => (
              <div className="segment-rule-row" key={index}>
                <span className="rule-number">{index + 1}</span>

                <label>
                  Field
                  <select
                    value={rule.field}
                    onChange={(event) => {
                      const field = event.target.value;
                      updateRule(index, "field", field);
                      if (field === "consent_status") {
                        updateRule(index, "value", "true");
                      } else {
                        updateRule(index, "value", "");
                      }
                    }}
                  >
                    {fields.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Operator
                  <select
                    value={rule.operator}
                    onChange={(event) =>
                      updateRule(index, "operator", event.target.value)
                    }
                  >
                    {operators
                      .filter((operator) =>
                        rule.field === "age"
                          ? operator.value !== "contains"
                          : ![
                              "greater_than",
                              "greater_than_or_equal",
                              "less_than",
                              "less_than_or_equal",
                            ].includes(operator.value)
                      )
                      .map((operator) => (
                        <option key={operator.value} value={operator.value}>
                          {operator.label}
                        </option>
                      ))}
                  </select>
                </label>

                {!["is_empty", "is_not_empty"].includes(rule.operator) && (
                  <label>
                    Value
                    {rule.field === "consent_status" ? (
                      <select
                        value={rule.value}
                        onChange={(event) =>
                          updateRule(index, "value", event.target.value)
                        }
                      >
                        <option value="true">Consented</option>
                        <option value="false">Not consented</option>
                      </select>
                    ) : (
                      <input
                        type={rule.field === "age" ? "number" : "text"}
                        value={rule.value}
                        onChange={(event) =>
                          updateRule(index, "value", event.target.value)
                        }
                        placeholder="Enter value"
                        required
                      />
                    )}
                  </label>
                )}

                <button
                  type="button"
                  className="rule-remove"
                  onClick={() => removeRule(index)}
                  disabled={rules.rules.length === 1}
                  aria-label={`Remove rule ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="segment-builder-actions">
            <button
              type="button"
              className="segment-secondary"
              onClick={addRule}
            >
              + Add rule
            </button>

            <div>
              <button
                type="button"
                className="segment-secondary"
                onClick={handlePreview}
                disabled={loading}
              >
                {loading ? "Please wait..." : "Preview audience"}
              </button>
              <button
                type="submit"
                className="segment-primary"
                disabled={loading}
              >
                {editingId ? "Update segment" : "Save segment"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {preview && (
        <section className="segment-panel">
          <div className="preview-summary">
            <div>
              <p>Matching audience</p>
              <strong>{preview.total}</strong>
            </div>
            <span>Sample of up to 10 members</span>
          </div>

          <div className="segment-table-wrap">
            <table className="segment-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>City</th>
                  <th>Language</th>
                  <th>Occupation</th>
                </tr>
              </thead>
              <tbody>
                {preview.sample.length ? (
                  preview.sample.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.age ?? "—"}</td>
                      <td>{member.city || "—"}</td>
                      <td>{member.language || "—"}</td>
                      <td>{member.occupation || "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No audience members match these rules.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="segment-panel">
        <div className="segment-panel-title">
          <div>
            <h2>Saved segments</h2>
            <p>{segments.length} segment(s) on this page</p>
          </div>
        </div>

        <div className="segment-table-wrap">
          <table className="segment-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Language</th>
                <th>Audience size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {segments.length ? (
                segments.map((segment) => (
                  <tr key={segment.id}>
                    <td>
                      <strong>{segment.name}</strong>
                      <small>{segment.description || "No description"}</small>
                    </td>
                    <td>{segment.language || "All languages"}</td>
                    <td>{segment.size ?? "—"}</td>
                    <td>
                      <div className="segment-row-actions">
                        <button
                          type="button"
                          onClick={() => handleViewMembers(segment)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(segment)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="delete-action"
                          onClick={() => handleDelete(segment)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No segments saved yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {members && (
        <section className="segment-panel">
          <div className="segment-panel-title">
            <div>
              <h2>{members.segmentName}</h2>
              <p>{members.total} matching member(s)</p>
            </div>
            <button
              type="button"
              className="segment-secondary"
              onClick={() => setMembers(null)}
            >
              Close
            </button>
          </div>

          <div className="segment-table-wrap">
            <table className="segment-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {members.items.length ? (
                  members.items.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.email || "—"}</td>
                      <td>{member.phone || "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No members in this segment.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
