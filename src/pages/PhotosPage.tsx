import { useEffect, useState, useRef, useCallback, type ChangeEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { IconCamera, IconShuffle, IconX, IconTrash, IconUpload, IconFolder, IconArrowLeftRight } from '../components/Icons'

interface Photo { id:string; date:string; category:string; storage_path:string; notes:string|null; url?:string }

export default function PhotosPage() {
  const { user } = useAuth()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [filter, setFilter] = useState<string>('todas')
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadCategory, setUploadCategory] = useState('frente')
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0])
  const [uploadNotes, setUploadNotes] = useState('')
  const [lightbox, setLightbox] = useState<string|null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [comparePhotos, setComparePhotos] = useState<[Photo|null, Photo|null]>([null, null])
  const [comparePos, setComparePos] = useState(50)
  const compareRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (user) loadPhotos() }, [user])

  const loadPhotos = async () => {
    if (!user) return
    const { data } = await supabase.from('progress_photos').select('*').eq('user_id', user.id).order('date', { ascending: false })
    if (data) {
      const withUrls = await Promise.all(data.map(async (p) => {
        const { data: urlData } = await supabase.storage.from('progress-photos').createSignedUrl(p.storage_path, 3600)
        return { ...p, url: urlData?.signedUrl }
      }))
      setPhotos(withUrls)
    }
  }

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !user) return

    // Validação de tipo de arquivo (defense-in-depth — bucket também bloqueia)
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Use JPEG, PNG, WebP, GIF ou HEIC.')
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    // Validação de tamanho (defense-in-depth — bucket limita a 10MB)
    if (file.size > MAX_FILE_SIZE) {
      alert('Arquivo muito grande. O tamanho máximo é 10MB.')
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    setUploading(true)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('progress-photos').upload(path, file)
    if (uploadError) { alert('Erro ao fazer upload: ' + uploadError.message); setUploading(false); return }
    const { error: insertError } = await supabase.from('progress_photos').insert({ user_id: user.id, date: uploadDate, category: uploadCategory, storage_path: path, notes: uploadNotes || null })
    if (insertError) { alert('Erro ao salvar registro: ' + insertError.message); setUploading(false); return }
    setShowUpload(false); setUploadNotes(''); setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    loadPhotos()
  }

  const deletePhoto = async (photo: Photo) => {
    if (!confirm('Excluir esta foto?')) return
    await supabase.storage.from('progress-photos').remove([photo.storage_path])
    await supabase.from('progress_photos').delete().eq('id', photo.id).eq('user_id', user!.id); loadPhotos()
  }

  const filtered = filter === 'todas' ? photos : photos.filter(p => p.category === filter)

  const selectForCompare = (photo: Photo) => {
    if (comparePhotos[0] === null) setComparePhotos([photo, null])
    else if (comparePhotos[1] === null) setComparePhotos([comparePhotos[0], photo])
    else setComparePhotos([photo, null])
  }

  const handleCompareMove = useCallback((clientX: number) => {
    if (!compareRef.current) return
    const rect = compareRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    setComparePos(pct)
  }, [])

  const categoryLabel: Record<string,string> = { frente:'Frente', lado:'Lado', costas:'Costas' }

  return (
    <div className="animate-slide-up">
      <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div><h1>Fotos de Progresso</h1><p>Registre sua evolução visual</p></div>
        <div style={{ display:'flex', gap:8 }}>
          <button className={`btn ${compareMode?'btn-primary':'btn-secondary'}`} onClick={() => { setCompareMode(!compareMode); setComparePhotos([null,null]) }}>
            {compareMode ? <><IconX size={15} /> Sair</> : <><IconShuffle size={15} /> Comparar</>}
          </button>
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}><IconUpload size={15} /> Upload</button>
        </div>
      </div>

      {compareMode && comparePhotos[0] && comparePhotos[1] && (
        <div className="card" style={{ marginBottom:24 }}>
          <div className="card-header"><h3 className="card-title">Comparação Antes / Depois</h3></div>
          <div ref={compareRef} className="photo-compare" style={{'--compare-position':`${comparePos}%`} as React.CSSProperties} onMouseMove={e => handleCompareMove(e.clientX)} onTouchMove={e => handleCompareMove(e.touches[0].clientX)}>
            {comparePhotos[0]?.url && <img src={comparePhotos[0].url} alt="Antes" />}
            {comparePhotos[1]?.url && <img src={comparePhotos[1].url} alt="Depois" className="photo-compare-after" />}
            <div className="photo-compare-slider"><div className="photo-compare-handle"><IconArrowLeftRight size={16} /></div></div>
            <span className="photo-compare-label before">{new Date(comparePhotos[0]!.date+'T12:00:00').toLocaleDateString('pt-BR')}</span>
            <span className="photo-compare-label after">{new Date(comparePhotos[1]!.date+'T12:00:00').toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      )}

      {compareMode && !(comparePhotos[0] && comparePhotos[1]) && (
        <div className="card" style={{ marginBottom:24, padding:20, textAlign:'center', color:'var(--text-secondary)' }}>
          {!comparePhotos[0] ? 'Selecione a foto "ANTES" clicando em uma foto abaixo' : 'Agora selecione a foto "DEPOIS"'}
        </div>
      )}

      <div className="tabs" style={{ marginBottom:24 }}>
        {['todas','frente','lado','costas'].map(cat => (
          <button key={cat} className={`tab ${filter===cat?'active':''}`} onClick={() => setFilter(cat)}>
            {cat === 'todas' ? 'Todas' : categoryLabel[cat]}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="photo-grid">
          {filtered.map(photo => (
            <div key={photo.id} className="photo-card" onClick={() => compareMode ? selectForCompare(photo) : setLightbox(photo.url||null)} style={{ outline: (comparePhotos[0]?.id===photo.id||comparePhotos[1]?.id===photo.id) ? '3px solid var(--accent-primary)' : 'none' }}>
              {photo.url ? <img src={photo.url} alt={`Progresso ${photo.category}`} loading="lazy" /> : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-tertiary)' }}><IconCamera size={32} /></div>}
              <div className="photo-card-overlay">
                <div className="photo-card-date">{new Date(photo.date+'T12:00:00').toLocaleDateString('pt-BR')}</div>
                <div className="photo-card-category">{categoryLabel[photo.category]||photo.category}</div>
              </div>
              {!compareMode && <button className="btn-icon" style={{ position:'absolute', top:8, right:8, fontSize:'0.8rem', opacity:0.7 }} onClick={e => { e.stopPropagation(); deletePhoto(photo) }} title="Excluir"><IconTrash size={14} /></button>}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state card"><div className="empty-state-icon"><IconCamera size={40} color="var(--text-tertiary)" /></div><div className="empty-state-text">Nenhuma foto encontrada</div><div className="empty-state-sub">Faça upload de fotos de progresso para acompanhar sua evolução visual</div></div>
      )}

      {lightbox && <div className="lightbox" onClick={() => setLightbox(null)}><button className="lightbox-close"><IconX size={20} /></button><img src={lightbox} alt="Progresso" /></div>}

      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2 className="modal-title">Upload de Foto</h2>
          <div className="form-group"><label className="form-label">Data</label><input type="date" className="form-input" value={uploadDate} onChange={e => setUploadDate(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Categoria</label><select className="form-select" value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}><option value="frente">Frente</option><option value="lado">Lado</option><option value="costas">Costas</option></select></div>
          <div className="form-group"><label className="form-label">Notas (opcional)</label><textarea className="form-textarea" placeholder="Observações..." value={uploadNotes} onChange={e => setUploadNotes(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Foto</label>
            <div className="upload-zone" onClick={() => fileRef.current?.click()}>
              <div className="upload-zone-icon"><IconFolder size={36} color="var(--text-tertiary)" /></div>
              <div className="upload-zone-text">Clique para selecionar ou <strong>arraste</strong> uma foto</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleUpload} />
          </div>
          {uploading && <div style={{ textAlign:'center', padding:16, color:'var(--accent-primary)' }}><div className="spinner" style={{ margin:'0 auto 8px' }} />Fazendo upload...</div>}
          <button className="btn btn-secondary" onClick={() => setShowUpload(false)}>Cancelar</button>
        </div></div>
      )}
    </div>
  )
}
