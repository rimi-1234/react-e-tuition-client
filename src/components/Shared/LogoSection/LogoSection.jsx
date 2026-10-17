const photos = [
  {
    src: '/images/students-collab.jpg',
    alt: 'Students working together around a laptop',
    caption: 'Study groups',
  },
  {
    src: '/images/tutor-session.jpg',
    alt: 'A tutor helping a student during a lesson',
    caption: 'In the classroom',
  },
  {
    src: '/images/study-notes.jpg',
    alt: 'Handwritten study notes and a pen on a desk',
    caption: 'Exam prep',
  },
  {
    src: '/images/lecture.jpg',
    alt: 'A lecturer teaching a university class',
    caption: 'Classroom support',
  },
];

const LogoSection = () => {
  return (
    <section className="mx-auto mt-16 max-w-6xl px-6" aria-label="Learning photos">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Real lessons</p>
          <h2 className="font-display text-2xl font-bold text-base-content">How learning looks here</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {photos.map((photo) => (
          <figure key={photo.src} className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
            <img
              src={photo.src}
              alt={photo.alt}
              className="h-40 w-full object-cover md:h-48"
            />
            <figcaption className="px-3 py-2 text-sm font-medium text-base-content">{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};

export default LogoSection;
