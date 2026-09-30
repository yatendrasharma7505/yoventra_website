import { INFLUENCER_TERMS, TERMS_VERSION } from './terms';

export function TermsContent({ compact = false }) {
  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      {INFLUENCER_TERMS.map((section, i) => (
        <section key={section.title}>
          <h3 className={`font-display font-bold text-foreground ${compact ? 'text-sm' : 'text-base'}`}>
            {i + 1}. {section.title}
          </h3>
          <ul className={`mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground ${compact ? 'text-xs' : 'text-sm'} leading-relaxed`}>
            {section.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-xs text-muted-foreground">Last updated: {TERMS_VERSION}</p>
    </div>
  );
}
