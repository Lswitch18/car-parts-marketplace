import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/modules/identity/store/authStore';
import { supabase } from '@/modules/shared/lib/supabase';
import { useI18n } from '@/modules/shared/lib/i18n';
import { api } from '@/modules/transactions/api/api';
import DOMPurify from 'dompurify';
import { BRANDS, BRAND_UUIDS, MODEL_UUIDS, CATEGORY_UUIDS, CATEGORIES } from '@/modules/shared/lib/constants';

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

  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.account_type === 'pessoa_fisica') {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      supabase.from('parts').select('id', { count: 'exact' }).eq('seller_id', user.id).gte('created_at', startOfMonth).then(({ count, error }) => {
        if (!error && count !== null) {
          setPartsCount(count);
          if (count >= 50) setShowLimitModal(true);
        }
      });
      return;
    }
    if ((user.account_type as string) !== 'pessoa_fisica' && !user.store_verified) {
      supabase.from('parts').select('id', { count: 'exact' }).eq('seller_id', user.id).then(({ count, error }) => {
        if (!error && count !== null) {
          setPartsCount(count);
          if (count >= 20) setShowUnverifiedModal(true);
        }
      });
    }
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

      const newTitle = data.title || formData.title;

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
        title: newTitle,
        description: data.description || formData.description,
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
        setCompatibilityTags(data.compatibility_tags);
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

      if (isAuction) {
        await api.auctions.create({
          title: cleanTitle,
          description: cleanDescription,
          starting_bid: parseFloat(formData.startingBid),
          buy_now_price: formData.buyNowPrice ? parseFloat(formData.buyNowPrice) : undefined,
          auction_duration_hours: parseInt(formData.auctionDurationHours),
          condition: formData.condition || 'new',
          brand_id: resolvedBrandId,
          category_id: resolvedCategoryId,
          model_id: resolvedModelId,
          images: uploadedUrls,
        } as any);
      } else {
        const payload: Record<string, any> = {
          seller_id: user.id,
          title: cleanTitle,
          description: cleanDescription,
          price: parseFloat(formData.price) || 0,
          condition: formData.condition || 'new',
          images: uploadedUrls.length > 0 ? uploadedUrls : (images.length > 0 ? images : []),
          status: 'active',
          year: safeYearStart,
          year_start: safeYearStart,
          year_end: safeYearEnd,
          brand: matchedBrand?.name || formData.brand || '',
          model: formData.model || '',
          category: matchedCat?.name || formData.category || '',
        };

        if (resolvedBrandId) payload.brand_id = resolvedBrandId;
        if (resolvedCategoryId) payload.category_id = resolvedCategoryId;
        if (resolvedModelId) payload.model_id = resolvedModelId;
        if (model3DUrl) payload.model_3d_url = model3DUrl;
        if (compatibilityTags && compatibilityTags.length > 0) {
          payload.compatibility_tags = compatibilityTags;
          payload.compatibility = compatibilityTags.join(', ');
        } else if (formData.model) {
          payload.compatibility = formData.model;
        }
        if (partNumber) {
          payload.part_number = partNumber;
          payload.oem_code = partNumber;
        }

        let { error: insertError } = await supabase.from('parts').insert(payload);

        if (insertError) {
          console.warn('Primary parts insert failed, attempting safe baseline payload:', insertError);
          const baselinePayload: Record<string, any> = {
            seller_id: user.id,
            title: cleanTitle,
            description: cleanDescription,
            price: parseFloat(formData.price) || 0,
            condition: formData.condition || 'new',
            images: uploadedUrls.length > 0 ? uploadedUrls : (images.length > 0 ? images : []),
            status: 'active',
            year: safeYearStart,
            year_start: safeYearStart,
            year_end: safeYearEnd,
          };
          if (resolvedBrandId) baselinePayload.brand_id = resolvedBrandId;
          if (resolvedCategoryId) baselinePayload.category_id = resolvedCategoryId;
          if (formData.model) baselinePayload.model = formData.model;

          const retry = await supabase.from('parts').insert(baselinePayload);
          if (retry.error) {
            throw retry.error;
          }
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
