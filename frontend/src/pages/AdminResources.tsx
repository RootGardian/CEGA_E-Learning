import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Video, Plus, Trash2, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';

interface Course {
  id: number;
  title: string;
  department: string;
}

interface Lesson {
  id: number;
  title: string;
  order: number;
}

interface Module {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseStructure extends Course {
  modules: Module[];
}

interface Resource {
  id: number;
  title: string;
  url: string;
  lessonId: number;
  lesson: {
    id: number;
    title: string;
    module: {
      id: number;
      title: string;
      course: Course;
    };
  };
}

const AdminResources: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { showAlert, showConfirm } = usePopup();

  // Form state
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [courseStructure, setCourseStructure] = useState<CourseStructure | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [filterDepartment, setFilterDepartment] = useState('All');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, resourcesRes] = await Promise.all([
        axios.get('/api/admin/courses', { withCredentials: true }),
        axios.get('/api/admin/resources', { withCredentials: true })
      ]);
      setCourses(coursesRes.data);
      setResources(resourcesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      showAlert('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchStructure = async () => {
      if (!selectedCourseId) {
        setCourseStructure(null);
        setSelectedLessonId('');
        return;
      }
      try {
        const res = await axios.get(`/api/admin/courses/${selectedCourseId}/structure`, { withCredentials: true });
        setCourseStructure(res.data);
        setSelectedLessonId('');
      } catch (err) {
        console.error('Error fetching course structure:', err);
        showAlert('Erreur lors du chargement de la structure du cours', 'error');
      }
    };
    fetchStructure();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url || !selectedLessonId) {
      showAlert('Veuillez remplir tous les champs', 'error');
      return;
    }

    // Basic YouTube URL validation
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      showAlert('Veuillez entrer une URL YouTube valide', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('/api/admin/resources', {
        title,
        url,
        lessonId: parseInt(selectedLessonId, 10)
      }, { withCredentials: true });
      
      showAlert('Ressource ajoutée avec succès', 'success');
      setTitle('');
      setUrl('');
      setSelectedCourseId('');
      fetchData();
    } catch (err) {
      console.error('Error adding resource:', err);
      showAlert('Erreur lors de l\'ajout de la ressource', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await showConfirm('Êtes-vous sûr de vouloir supprimer cette ressource ?');
    if (!confirm) return;

    try {
      await axios.delete(`/api/admin/resources/${id}`, { withCredentials: true });
      showAlert('Ressource supprimée avec succès', 'success');
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting resource:', err);
      showAlert('Erreur lors de la suppression de la ressource', 'error');
    }
  };

  const departments = ['All', ...Array.from(new Set(courses.map(c => c.department)))];

  const filteredResources = resources.filter(r => {
    if (filterDepartment !== 'All' && r.lesson?.module?.course?.department !== filterDepartment) return false;
    return true;
  });

  return (
    <div className="dashboard-content animate-fade-in" style={{ padding: 'clamp(1rem, 3vw, 2rem)', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="responsive-header">
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Video size={32} color="var(--accent-primary)" />
            Ressources des Séances
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Ajoutez des vidéos YouTube associées à des séances spécifiques.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Formulaire d'ajout */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} color="var(--accent-primary)" /> Ajouter une ressource
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Filière & Cours</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="input-field"
                style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
              >
                <option value="">-- Sélectionner un cours --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    [{course.department}] {course.title}
                  </option>
                ))}
              </select>
            </div>

            {courseStructure && (
              <div className="animate-fade-in">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Séance (Lesson)</label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                >
                  <option value="">-- Sélectionner une séance --</option>
                  {courseStructure.modules.map(module => (
                    <optgroup key={`mod-${module.id}`} label={`Module: ${module.title}`}>
                      {module.lessons.map(lesson => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Titre de la vidéo</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Introduction à la topographie..."
                className="input-field"
                style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Lien YouTube</label>
              <div style={{ position: 'relative' }}>
                <LinkIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="input-field"
                  style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting || !title || !url || !selectedLessonId}
              style={{ marginTop: '0.5rem', padding: '0.75rem', opacity: (isSubmitting || !title || !url || !selectedLessonId) ? 0.5 : 1 }}
            >
              {isSubmitting ? 'Ajout en cours...' : 'Ajouter la ressource'}
            </button>
          </form>
        </div>

        {/* Liste des ressources */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>Ressources existantes</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                style={{ padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '0.85rem' }}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept === 'All' ? 'Toutes filières' : dept}</option>
                ))}
              </select>
              <button onClick={fetchData} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem' }}>
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px', paddingRight: '0.5rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Chargement...</div>
            ) : filteredResources.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                Aucune ressource trouvée.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredResources.map(resource => (
                  <div key={resource.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>{resource.title}</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span><span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Cours:</span> {resource.lesson?.module?.course?.title}</span>
                        <span><span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Séance:</span> {resource.lesson?.title}</span>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', marginTop: '0.25rem', wordBreak: 'break-all' }}>
                          {resource.url}
                        </a>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(resource.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResources;
