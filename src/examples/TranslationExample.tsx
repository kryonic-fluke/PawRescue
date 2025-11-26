import { useTranslationSafe } from "@/hooks/useTranslationSafe";

export function TranslationExample() {
  const { t } = useTranslationSafe();
  
  return (
    <div className="p-4 space-y-4 bg-white/5 rounded-lg border border-white/10 mb-8">
      <h2 className="text-xl font-bold text-white mb-2">
        {t('examples.translation.title', { defaultValue: 'Translation Example' })}
      </h2>
      <p className="text-white/80">
        {t('examples.translation.description', { 
          defaultValue: 'This component demonstrates how to use the translation system.' 
        })}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-3 bg-white/5 rounded">
          <h3 className="font-medium text-white">
            {t('examples.translation.simpleExample', { defaultValue: 'Simple Translation:' })}
          </h3>
          <p className="text-sm text-white/70">
            {t('home.welcome', { defaultValue: 'Welcome!' })}
          </p>
        </div>
        <div className="p-3 bg-white/5 rounded">
          <h3 className="font-medium text-white">
            {t('examples.translation.withVariables', { defaultValue: 'With Variables:' })}
          </h3>
          <p className="text-sm text-white/70">
            {t('home.welcome', { 
              name: 'User',
              defaultValue: 'Welcome, {{name}}!' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
