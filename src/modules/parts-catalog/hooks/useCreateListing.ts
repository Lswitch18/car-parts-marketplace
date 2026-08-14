import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/modules/identity/store/authStore';
import { supabase } from '@/modules/shared/lib/supabase';
import { useI18n } from '@/modules/shared/lib/i18n';
import { api } from '@/modules/transactions/api/api';
import DOMPurify from 'dompurify';
import { BRANDS, BRAND_UUIDS, MODEL_UUIDS, CATEGORY_UUIDS } from '@/modules/shared/lib/constants';

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
        setAiError(t('A imagem não parece ser uma peça automotiva válida. O cadastro foi bloqueado e a imagem removida.'));
        removeImage(0);
        return;
      }

      const newTitle = data.title || formData.title;
      let newFormData = {
        title: newTitle,
        description: data.description || formData.description,
        price: data.estimated_price?.toString() || formData.price,
        brand: data.brand || formData.brand,
        model: data.model || formData.model,
        category: data.category || formData.category,
        yearStart: data.year_start?.toString() || formData.yearStart,
        yearEnd: data.year_end?.toString() || formData.yearEnd,
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
        // Mock images or base64 (already handled in UI differently usually, but keeping logic)
        uploadedUrls = images;
      }

      if (isAuction) {
        await api.auctions.create({
          title: cleanTitle,
          description: cleanDescription,
          starting_bid: parseFloat(formData.startingBid),
          buy_now_price: formData.buyNowPrice ? parseFloat(formData.buyNowPrice) : undefined,
          auction_duration_hours: parseInt(formData.auctionDurationHours),
          condition: formData.condition,
          brand_id: BRAND_UUIDS[formData.brand as keyof typeof BRAND_UUIDS],
          category_id: CATEGORY_UUIDS[formData.category as keyof typeof CATEGORY_UUIDS],
          model_id: MODEL_UUIDS[formData.model as keyof typeof MODEL_UUIDS],
          images: uploadedUrls,
        } as any);
      } else {
        const { error } = await supabase.from('parts').insert({
          seller_id: user.id,
          title: cleanTitle,
          description: cleanDescription,
          price: parseFloat(formData.price),
          brand_id: BRAND_UUIDS[formData.brand as keyof typeof BRAND_UUIDS],
          model_id: MODEL_UUIDS[formData.model as keyof typeof MODEL_UUIDS],
          year_start: parseInt(formData.yearStart),
          year_end: parseInt(formData.yearEnd),
          category_id: CATEGORY_UUIDS[formData.category as keyof typeof CATEGORY_UUIDS],
          condition: formData.condition,
          images: uploadedUrls,
          model_3d_url: model3DUrl,
          status: 'active',
          compatibility_tags: compatibilityTags,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      navigate('/tenant-dashboard');
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
