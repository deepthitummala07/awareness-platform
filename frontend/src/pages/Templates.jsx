import { useEffect, useState } from "react";
import api from "../services/api";
import "./Templates.css";

function Templates() {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    title: "",
    category: "Awareness",
    language: "English",
    channel: "SMS",
    content: "",
    tags: "",
  });

  const loadTemplates = async () => {
    setLoading(true);

    try {
      const response = await api.get("/templates/", {
        params: {
          search: search || undefined,
          language: language || undefined,
          category: category || undefined,
          limit: 100,
        },
      });

      setTemplates(response.data.items || []);
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Unable to load templates."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [search, language, category]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const saveTemplate = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await api.post("/templates/", {
        ...form,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      setMessage("Template created successfully.");

      setForm({
        name: "",
        title: "",
        category: "Awareness",
        language: "English",
        channel: "SMS",
        content: "",
        tags: "",
      });

      loadTemplates();
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Failed to create template."
      );
    }
  };

  const deleteTemplate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      await api.delete(`/templates/${id}`);
      setMessage("Template deleted successfully.");
      loadTemplates();
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Failed to delete template."
      );
    }
  };

  const previewTemplate = async (content) => {
    try {
      const response = await api.post("/templates/preview", {
        content,
        sample_data: {
          name: "Ravi",
          area: "Hyderabad",
        },
      });

      setPreview(response.data.preview_content);
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Unable to preview template."
      );
    }
  };

  return (
    <div className="templates-page">
      <div className="templates-header">
        <div>
          <h1>Template Library</h1>
          <p>Create and manage reusable multilingual messages.</p>
        </div>
      </div>

      {message && <p className="template-message">{message}</p>}

      <section className="template-form-section">
        <h2>Create a Template</h2>

        <form onSubmit={saveTemplate} className="template-form">
          <input
            name="name"
            placeholder="Template name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="title"
            placeholder="Message title"
            value={form.title}
            onChange={handleChange}
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option>Awareness</option>
            <option>Emergency</option>
            <option>Education</option>
            <option>Health</option>
            <option>General</option>
          </select>

          <select
            name="language"
            value={form.language}
            onChange={handleChange}
          >
            <option>English</option>
            <option>Telugu</option>
            <option>Hindi</option>
            <option>Tamil</option>
            <option>Kannada</option>
            <option>Marathi</option>
            <option>Bengali</option>
            <option>Urdu</option>
          </select>

          <select
            name="channel"
            value={form.channel}
            onChange={handleChange}
          >
            <option>SMS</option>
            <option>Email</option>
            <option>WhatsApp</option>
            <option>Push Notification</option>
          </select>

          <input
            name="tags"
            placeholder="Tags, separated by commas"
            value={form.tags}
            onChange={handleChange}
          />

          <textarea
            name="content"
            placeholder="Write your message. Use {name} and {area} as placeholders."
            value={form.content}
            onChange={handleChange}
            required
            rows="4"
          />

          <button type="submit">Create Template</button>
        </form>
      </section>

      <section className="template-list-section">
        <h2>Saved Templates ({templates.length})</h2>

        <div className="template-filters">
          <input
            placeholder="Search templates..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="">All Languages</option>
            <option>English</option>
            <option>Telugu</option>
            <option>Hindi</option>
            <option>Tamil</option>
            <option>Kannada</option>
            <option>Marathi</option>
            <option>Bengali</option>
            <option>Urdu</option>
          </select>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All Categories</option>
            <option>Awareness</option>
            <option>Emergency</option>
            <option>Education</option>
            <option>Health</option>
            <option>General</option>
          </select>
        </div>

        {loading ? (
          <p>Loading templates...</p>
        ) : templates.length === 0 ? (
          <p>No templates found. Create your first template above.</p>
        ) : (
          <div className="template-grid">
            {templates.map((template) => (
              <article className="template-card" key={template.id}>
                <div className="template-card-header">
                  <h3>{template.name}</h3>
                  <span>{template.language}</span>
                </div>

                <p><strong>Title:</strong> {template.title || "Untitled"}</p>
                <p><strong>Category:</strong> {template.category}</p>
                <p><strong>Channel:</strong> {template.channel}</p>

                <div className="template-content">
                  {template.content}
                </div>

                {template.tags?.length > 0 && (
                  <p className="template-tags">
                    Tags: {template.tags.join(", ")}
                  </p>
                )}

                <div className="template-actions">
                  <button
                    type="button"
                    onClick={() => previewTemplate(template.content)}
                  >
                    Preview
                  </button>

                  <button
                    type="button"
                    className="template-delete"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {preview && (
          <div className="template-preview">
            <h3>Message Preview</h3>
            <p>{preview}</p>
            <button type="button" onClick={() => setPreview("")}>
              Close Preview
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Templates;