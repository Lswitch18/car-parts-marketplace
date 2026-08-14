import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/modules/identity/store/authStore';
import { supabase } from '@/modules/shared/lib/supabase';
import { useI18n } from '@/modules/shared/lib/i18n';
import { api } from '@/modules/transactions/api/api';
import DOMPurify from 'dompurify';
import { BRANDS, BRAND_UUIDS, MODEL_UUIDS, CATEGORY_UUIDS, CATEGORIES } from '@/modules/shared/lib/constants';
import { localizeProductTitle, localizeProductDescription, translateTextAsync } from '@/modules/parts-catalog/utils/catalogLocalizer';

export function useCreateListing() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [generating3D, setGenerating3D] = useState(false);
  const [model3DUrl, setModel3DUrl] = useState<string | null>(null);
  
  const [aiProgress, setAiProgress] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);
  
  const [partNumber, setPartNumber] = useState<string | null>(null);
  const [isOfficialData, setIsOfficialData] = useState(false);
  const [brandMismatch, setBrandMismatch] = useState(false);
  const [vin, setVin] = useState('');
  
  const [aiEnabled, setAiEnabled] = useState(true);
  const [isAuction, setIsAuction] = useState(false);
  const [partsCount, setPartsCount] = useState<number | null>(null);
  
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);
  
  const [certifyingPrice, setCertifyingPrice] = useState(false);
  const [priceCertification, setPriceCertification] = useState<{ is_fair: boolean; recommended_min: number; recommended_max: number; reasoning: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', brand: '', model: '', yearStart: '', yearEnd: '', category: '', condition: '', startingBid: '', buyNowPrice: '', auctionDurationHours: '72',
  });
  
  const [compatibilityTags, setCompatibilityTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevLangRef = useRef<string>(language);

  // Dynamic language switcher: translate filled form fields when user switches language in UI (PT <-> JA)
  useEffect(() => {
    if (prevLangRef.current !== language) {
      const prevLang = prevLangRef.current;
      prevLangRef.current = language;

      const translateActiveFields = async () => {
        let updated = false;
        let newTitle = formData.title;
        let newDesc = formData.description;

        if (formData.title && formData.title.trim()) {
          newTitle = await translateTextAsync(formData.title, language);
          updated = true;
        }

        if (formData.description && formData.description.trim()) {
          newDesc = await translateTextAsync(formData.description, language);
          updated = true;
        }

        if (updated) {
          setFormData(prev => ({
            ...prev,
            title: newTitle,
            description: newDesc,
          }));
        }

        if (compatibilityTags.length > 0) {
          const translatedTags = await Promise.all(
            compatibilityTags.map(tag => translateTextAsync(tag, language))
          );
          setCompatibilityTags(translatedTags);
        }
      };

      translateActiveFields();
    }
  }, [language, formData.title, formData.description, compatibilityTags]);

  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from('parts').select('id', { count: 'exact' }).eq('seller_id', user.id).then(({ count, error }) => {
      if (!error && count !== null) {
        setPartsCount(count);
      }
    });
  }, [user]);

  const analyzeWithAI = async () => {
    if (images.length === 0) return;
    try {
      setAiError(null); setAnalyzing(true); setAiProgress(0); setBrandMismatch(false);
      progressIntervalRef.current = setInterval(() => {
        setAiProgress(prev => (prev < 95 ? prev + (Math.random() * 1.5) : prev));
      }, 1500);
      
      const data = await api.ai.analyzePart(images[0], language, vin) as any;
      setAnalyzing(false);

      if (data.is_car_part === false) {
        setAiError(t('A IA não conseguiu reconhecer todos os detalhes da peça automaticamente. Preencha os campos abaixo para concluir.'));
        return;
      }

      // Localize AI-suggested title and description to match user's current language 100%
      const rawTitle = data.title || formData.title;
      const localizedTitle = await translateTextAsync(rawTitle, language);

      const rawDesc = data.description || formData.description;
      const localizedDesc = await translateTextAsync(rawDesc, language);

      // Smart Brand resolution from AI
      let matchedBrandId = formData.brand;
      if (data.brand) {
        const brandKey = data.brand.toString().toLowerCase().trim();
        const b = BRANDS.find(br => br.id.toLowerCase() === brandKey || br.name.toLowerCase() === brandKey);
        if (b) matchedBrandId = b.id;
      }

      // Smart Category resolution from AI
      let matchedCategoryId = formData.category;
      if (data.category) {
        const catKey = data.category.toString().toLowerCase().trim();
        const c = CATEGORIES.find(cat => cat.id.toLowerCase() === catKey || cat.name.toLowerCase() === catKey);
        if (c) matchedCategoryId = c.id;
      }

      // Normalize Year Range
      let startY = data.year_start ? parseInt(data.year_start) : null;
      let endY = data.year_end ? parseInt(data.year_end) : null;
      if (startY && endY && startY > endY) {
        const temp = startY;
        startY = endY;
        endY = temp;
      }

      let newFormData = {
        title: localizedTitle,
        description: localizedDesc,
        price: data.estimated_price?.toString() || formData.price,
        brand: matchedBrandId,
        model: data.model || formData.model,
        category: matchedCategoryId,
        condition: data.condition || formData.condition || 'new',
        yearStart: startY ? startY.toString() : formData.yearStart,
        yearEnd: endY ? endY.toString() : formData.yearEnd,
      };

      if (data.part_number) {
        setPartNumber(data.part_number);
        setIsOfficialData(data.is_verified || false);
        setBrandMismatch(data.brand_mismatch || false);
      } else {
        setPartNumber(null);
        setIsOfficialData(false);
        setBrandMismatch(false);
      }

      if (data.compatibility_tags && Array.isArray(data.compatibility_tags)) {
        const translatedTags = await Promise.all(
          data.compatibility_tags.map((tag: string) => translateTextAsync(tag, language))
        );
        setCompatibilityTags(translatedTags);
      } else {
        setCompatibilityTags([]);
      }
      
      setFormData(prev => ({ ...prev, ...newFormData }));
    } catch (error) {
      alert(t('Não foi possível analisar a imagem. Tente preencher manualmente.'));
    } finally {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setAiProgress(100);
      setTimeout(() => { setAnalyzing(false); setAiProgress(0); }, 800);
    }
  };

  const handleCertifyPrice = async () => {
    if (!formData.title || !formData.price) {
      alert(t('Preencha o título e o preço antes de verificar.'));
      return;
    }
    setCertifyingPrice(true); setPriceCertification(null);
    try {
      const brandName = BRANDS.find(b => b.id === formData.brand)?.name || formData.brand;
      const data = await api.ai.certifyPrice({
        title: formData.title,
        brand: brandName,
        model: formData.model,
        part_number: partNumber || undefined,
        condition: formData.condition,
        suggested_price: parseFloat(formData.price)
      });
      setPriceCertification(data as any);
    } catch (err) {
      alert(t('Falha ao certificar o preço.'));
    } finally {
      setCertifyingPrice(false);
    }
  };

  const createListing = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      
      // Shift-Left Security: DOMPurify Sanitization
      const cleanTitle = DOMPurify.sanitize(formData.title.trim());
      const cleanDescription = DOMPurify.sanitize(formData.description.trim());

      // Normalize Year Range so startYear <= endYear
      const rawStart = parseInt(formData.yearStart);
      const rawEnd = parseInt(formData.yearEnd);
      const currentYear = new Date().getFullYear();
      const validStart = !isNaN(rawStart) ? rawStart : (!isNaN(rawEnd) ? rawEnd : currentYear);
      const validEnd = !isNaN(rawEnd) ? rawEnd : validStart;
      const safeYearStart = Math.min(validStart, validEnd);
      const safeYearEnd = Math.max(validStart, validEnd);

      // Safe Brand / Category / Model resolution
      const brandLower = (formData.brand || '').toLowerCase().trim();
      const matchedBrand = BRANDS.find(b => b.id.toLowerCase() === brandLower || b.name.toLowerCase() === brandLower);
      const resolvedBrandKey = matchedBrand ? matchedBrand.id : brandLower;
      const resolvedBrandId = BRAND_UUIDS[resolvedBrandKey] || (formData.brand?.match(/^[0-9a-f-]{36}$/i) ? formData.brand : null);

      const catLower = (formData.category || '').toLowerCase().trim();
      const matchedCat = CATEGORIES.find(c => c.id.toLowerCase() === catLower || c.name.toLowerCase() === catLower);
      const resolvedCatKey = matchedCat ? matchedCat.id : catLower;
      const resolvedCategoryId = CATEGORY_UUIDS[resolvedCatKey] || (formData.category?.match(/^[0-9a-f-]{36}$/i) ? formData.category : null);

      const resolvedModelId = MODEL_UUIDS[formData.model] || (formData.model?.match(/^[0-9a-f-]{36}$/i) ? formData.model : null);

      // Map condition to PostgreSQL check constraint ('new', 'like_new', 'good', 'fair', 'excellent')
      let safeCondition = 'good';
      const cond = (formData.condition || '').toLowerCase().trim();
      if (cond === 'new') safeCondition = 'new';
      else if (cond === 'like_new' || cond === 'excellent' || cond === 'refurbished') safeCondition = 'like_new';
      else if (cond === 'good' || cond === 'used') safeCondition = 'good';
      else if (cond === 'fair' || cond === 'poor') safeCondition = 'fair';

      // Guaranteed non-null category_id (defaults to Wings & Spoilers if none matched)
      const fallbackCategoryId = '002ac22c-2a9d-4a08-920c-fc507d53173b';
      const finalCategoryId = resolvedCategoryId || fallbackCategoryId;

      setUploading(true);
      let uploadedUrls: string[] = [];

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const { error: uploadError } = await supabase.storage
            .from('parts-images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('parts-images')
            .getPublicUrl(fileName);

          uploadedUrls.push(publicUrl);
        }
      } else if (images.length > 0) {
        uploadedUrls = images;
      }

      const tagsList = compatibilityTags && compatibilityTags.length > 0 
        ? compatibilityTags 
        : (formData.model ? [formData.model] : []);

      if (isAuction) {
        await api.auctions.create({
          title: cleanTitle,
          description: cleanDescription,
          starting_bid: parseFloat(formData.startingBid),
          buy_now_price: formData.buyNowPrice ? parseFloat(formData.buyNowPrice) : undefined,
          auction_duration_hours: parseInt(formData.auctionDurationHours),
          condition: safeCondition,
          brand_id: resolvedBrandId,
          category_id: finalCategoryId,
          model_id: resolvedModelId,
          images: uploadedUrls,
        } as any);
      } else {
        const payload: Record<string, any> = {
          seller_id: user.id,
          title: cleanTitle,
          description: cleanDescription,
          price: parseFloat(formData.price) || 0,
          condition: safeCondition,
          images: uploadedUrls.length > 0 ? uploadedUrls : (images.length > 0 ? images : []),
          status: 'active',
          category_id: finalCategoryId,
          year: !isNaN(safeYearStart) ? safeYearStart : currentYear,
          compatibility_tags: tagsList,
        };

        if (resolvedBrandId) payload.brand_id = resolvedBrandId;
        if (resolvedModelId) payload.model_id = resolvedModelId;
        if (partNumber) payload.part_number = partNumber;
        if (tagsList.length > 0) payload.compatibility = tagsList;

        console.log('[createListing] Executing parts insert payload:', payload);
        const { error: insertError } = await supabase.from('parts').insert(payload);

        if (insertError) {
          console.error('[createListing] Parts insert error:', insertError.message, '| code:', insertError.code, '| details:', insertError.details, '| hint:', insertError.hint);
          throw insertError;
        }
      }
    },
    onSuccess: () => {
      navigate('/tenant-dashboard');
    },
    onError: (err: any) => {
      console.error('Error creating part listing:', err);
      alert(t('Falha ao cadastrar a peça: ') + (err?.message || t('Por favor, tente novamente.')));
    },
    onSettled: () => setUploading(false)
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTagInput.trim() && !compatibilityTags.includes(newTagInput.trim())) {
      setCompatibilityTags([...compatibilityTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCompatibilityTags(compatibilityTags.filter(tag => tag !== tagToRemove));
  };

  return {
    state: {
      images, imageFiles, uploading, analyzing, aiProgress, aiError, partNumber,
      isOfficialData, brandMismatch, vin, aiEnabled, isAuction, partsCount,
      showLimitModal, showUnverifiedModal, certifyingPrice, priceCertification,
      formData, compatibilityTags, newTagInput, generating3D, model3DUrl, t, language
    },
    actions: {
      setImages, setImageFiles, setUploading, setAnalyzing, setAiProgress, setAiError,
      setPartNumber, setIsOfficialData, setBrandMismatch, setVin, setAiEnabled,
      setIsAuction, setPartsCount, setShowLimitModal, setShowUnverifiedModal,
      setCertifyingPrice, setPriceCertification, setFormData, setCompatibilityTags,
      setNewTagInput, analyzeWithAI, handleCertifyPrice, createListing,
      handleImageChange, removeImage, addTag, removeTag
    }
  };
}
