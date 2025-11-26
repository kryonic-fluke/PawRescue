import { useTranslationSafe } from "@/hooks/useTranslationSafe";
import { Button } from "@/components/ui/button";

export function LanguageSelector() {
  const { i18n } = useTranslationSafe();
  const currentLanguage = i18n.language;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant={currentLanguage === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => changeLanguage('en')}
      >
        English
      </Button>
      <Button 
        variant={currentLanguage === 'es' ? 'default' : 'outline'}
        size="sm"
        onClick={() => changeLanguage('es')}
      >
        Español
      </Button>
      <Button 
        variant={currentLanguage === 'hi' ? 'default' : 'outline'}
        size="sm"
        onClick={() => changeLanguage('hi')}
      >
        हिंदी
      </Button>
    </div>
  );
}
