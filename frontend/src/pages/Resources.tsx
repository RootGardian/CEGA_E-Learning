import React, { useState, useEffect } from 'react';
import { Play, Search, BookOpen } from 'lucide-react';
import axios from 'axios';

interface VideoResource {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  category: string;
}

// Liste des vidéos — ajouter les liens YouTube ici
const hardcodedVideos: VideoResource[] = [
  {
    id: 'global-1',
    title: 'Immersion pédagogique de nos étudiants au musée national de la géologie',
    description: 'Dans le cadre de leur formation au CEGA, nos étudiants ont effectué une immersion au musée national de la géologie afin de renforcer leurs connaissances à travers une expérience pratique et enrichissante.',
    youtubeId: 'axoSHKqE5fc',
    category: 'Géologie'
  },
  {
    id: 'global-2',
    title: 'Témoignage | Une apprenante partage son expérience',
    description: 'Au CEGA, nos étudiants sont les mieux placés pour témoigner de leur expérience. À travers cette vidéo, découvrez le parcours, les apprentissages et les motivations d\'une apprenante.',
    youtubeId: '3wxML2DPp1k',
    category: 'Témoignages'
  },
  {
    id: 'global-3',
    title: 'Formation : Tout savoir sur le certificat SIG',
    description: 'À travers cette vidéo, le CEGA vous présente le Certificat en SIG et Gestions des Bases de Données : son importance, son contenu et ses débouchés professionnels.',
    youtubeId: 'hhf3DplbGpg',
    category: 'Formations'
  },
  {
    id: 'global-4',
    title: 'Formation : Découvrez nos cours préparatoires',
    description: 'Bienvenue dans cette vidéo dédiée aux cours préparatoires en Géosciences Appliquées ! Découvrez les bases essentielles de la géologie à travers cette formation.',
    youtubeId: 'i7QHNy0cTGE',
    category: 'Formations'
  },
];

const extractYoutubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : '';
};

const Resources: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoResource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tout');

  const videos = [...hardcodedVideos];
  const categories = ['Tout', ...Array.from(new Set(videos.map(v => v.category)))];

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Tout' || v.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="dashboard-content animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2rem)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          <BookOpen size={28} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Ressources Pédagogiques
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Vidéos de cours, tutoriels et supports complémentaires pour approfondir vos connaissances.
        </p>
      </div>

      {/* Video Player */}
      {selectedVideo && (
        <div className="glass-panel animate-fade-in" style={{ marginBottom: '2rem', padding: '0', overflow: 'hidden' }}>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
              title={selectedVideo.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
            <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {selectedVideo.title}
            </h2>
            <span style={{ 
              display: 'inline-block',
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: 'var(--accent-primary)', 
              padding: '0.2rem 0.6rem', 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              border: '1px solid rgba(16, 185, 129, 0.3)', 
              borderRadius: '4px',
              marginBottom: '0.5rem'
            }}>
              {selectedVideo.category}
            </span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {selectedVideo.description}
            </p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ 
          flex: '1 1 250px', 
          position: 'relative' 
        }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Rechercher une vidéo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.5rem 1rem',
                border: activeCategory === cat ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                borderRadius: '6px',
                backgroundColor: activeCategory === cat ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
                color: activeCategory === cat ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: activeCategory === cat ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            {videos.length === 0 ? 'Les ressources vidéo seront bientôt disponibles.' : 'Aucune vidéo ne correspond à votre recherche.'}
          </p>
          <p style={{ fontSize: '0.9rem' }}>
            {videos.length === 0 ? 'Revenez bientôt pour découvrir du contenu pédagogique enrichi.' : 'Essayez un autre mot-clé ou une autre catégorie.'}
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', 
          gap: '1.5rem' 
        }}>
          {filteredVideos.map(video => (
            <div
              key={video.id}
              className="glass-panel"
              onClick={() => {
                setSelectedVideo(video);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                cursor: 'pointer',
                overflow: 'hidden',
                padding: 0,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              {/* Thumbnail */}
              <div style={{ position: 'relative', paddingBottom: '56.25%', backgroundColor: '#000' }}>
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Play size={24} color="white" fill="white" />
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  color: 'var(--text-primary)', 
                  marginBottom: '0.4rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {video.title}
                </h3>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--accent-primary)', 
                  fontWeight: 600 
                }}>
                  {video.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;
