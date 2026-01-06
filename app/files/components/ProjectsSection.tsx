"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type Project = {
  title: string;
  client: string;
  category: string;
  description: string;
  technologies: string;
  images: File[];
  cadFiles: File[];
  projectType: string;
  industry: string;
  team: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  tags: string;
};

export default function ProjectsSection({ login }: { login: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [cadFiles, setCadFiles] = useState<File[]>([]);
  const [projectType, setProjectType] = useState("");
  const [industry, setIndustry] = useState("");
  const [team, setTeam] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setError(null);
  }, [open]);

  function reset() {
    setTitle("");
    setClient("");
    setCategory("");
    setDescription("");
    setTechnologies("");
    setImages([]);
    setCadFiles([]);
    setProjectType("");
    setIndustry("");
    setTeam("");
    setStartDate("");
    setEndDate("");
    setTags("");
    setError(null);
  }

  function onSave() {
    const t = title.trim();
    if (!t) {
      setError("Project Title is required");
      return;
    }
    if (startDate && endDate) {
      const s = new Date(startDate).getTime();
      const e = new Date(endDate).getTime();
      if (Number.isFinite(s) && Number.isFinite(e) && s > e) {
        setError("Start date must be before End date");
        return;
      }
    }
    const p: Project = {
      title: t,
      client: client.trim(),
      category: category.trim(),
      description: description.trim(),
      technologies: technologies.trim(),
      images,
      cadFiles,
      projectType: projectType.trim(),
      industry: industry.trim(),
      team: team.trim(),
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      tags: tags.trim(),
    };
    setProjects((arr) => [...arr, p]);
    setOpen(false);
    reset();
    toast.success("Project added");
  }

  return (
    <>
      <div className="drive-recent">
        <div className="drive-recent-tabs">
          <button className="chip active">All</button>
          <button className="chip">Active</button>
          <button className="chip">Archived</button>
        </div>
        <div className="ml-auto">
          <button className="btn-primary" onClick={() => setOpen(true)}>
            + Add project
          </button>
        </div>
      </div>

      <div className="drive-table projects-table">
        <div className="drive-row head">
          <div>Project</div>
          <div>Client</div>
          <div>Category</div>
          <div>Type</div>
          <div>Start</div>
          <div>End</div>
          <div>Team</div>
          <div>Tags</div>
          <div>Files</div>
        </div>
        {projects.length === 0 ? (
          <div className="drive-row">
            <div>No projects added yet.</div>
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
        ) : null}
        {projects.map((p, i) => (
          <div key={i} className="drive-row">
            <div>
              <span className="file-icon" /> {p.title}
              <div className="sub">
                {p.description
                  ? p.description.slice(0, 60) +
                    (p.description.length > 60 ? "…" : "")
                  : ""}
              </div>
            </div>
            <div>{p.client || "—"}</div>
            <div>{p.category || "—"}</div>
            <div>{p.projectType || "—"}</div>
            <div>{p.startDate || "—"}</div>
            <div>{p.endDate || "—"}</div>
            <div>{p.team || login || "Me"}</div>
            <div>{p.tags || "—"}</div>
            <div>{p.images.length + p.cadFiles.length || 0} files</div>
          </div>
        ))}
      </div>

      {open ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card max-w-2xl">
            <div className="modal-header">Add project</div>
            <div className="modal-body grid grid-cols-1 gap-4">
              <label className="block">
                <span className="sr-only">Project Title</span>
                <input
                  className="ms-input ms-input-dark"
                  placeholder="Project Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="sr-only">Client</span>
                  <input
                    className="ms-input ms-input-dark"
                    placeholder="Client"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="sr-only">Category / Domain</span>
                  <input
                    className="ms-input ms-input-dark"
                    placeholder="Category / Domain"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </label>
              </div>
              <label className="block">
                <span className="sr-only">Description</span>
                <textarea
                  className="ms-input ms-input-dark"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="sr-only">Technologies / Tools</span>
                  <input
                    className="ms-input ms-input-dark"
                    placeholder="Technologies / Tools"
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="sr-only">Project Type</span>
                  <input
                    className="ms-input ms-input-dark"
                    placeholder="Project Type"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="sr-only">Industry Application</span>
                  <input
                    className="ms-input ms-input-dark"
                    placeholder="Industry Application"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="sr-only">Team</span>
                  <input
                    className="ms-input ms-input-dark"
                    placeholder="Team"
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-neutral-300">Start date</span>
                  <input
                    className="ms-input ms-input-dark"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-neutral-300">End date</span>
                  <input
                    className="ms-input ms-input-dark"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="sr-only">Tags / Keywords</span>
                  <input
                    className="ms-input ms-input-dark"
                    placeholder="Tags / Keywords (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-neutral-300">
                    3D Models / Images
                  </span>
                  <input
                    className="ms-input ms-input-dark"
                    type="file"
                    multiple
                    accept="image/*,.obj,.fbx,.glb,.gltf,.stl,.3ds,.step,.stp"
                    onChange={(e) =>
                      setImages(Array.from(e.target.files || []))
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-neutral-300">
                    Download / CAD Files
                  </span>
                  <input
                    className="ms-input ms-input-dark"
                    type="file"
                    multiple
                    accept=".dwg,.dxf,.step,.stp,.iges,.igs,.sat,.catpart,.sldprt,.prt,.3dm,application/*"
                    onChange={(e) =>
                      setCadFiles(Array.from(e.target.files || []))
                    }
                  />
                </label>
              </div>
              {error ? <p className="text-[#ff8c8c] text-sm">{error}</p> : null}
            </div>
            <div className="modal-actions">
              <button
                className="btn-muted"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={onSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
