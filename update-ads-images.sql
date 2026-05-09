UPDATE public.parts SET images = ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b37d5?w=600'] WHERE id = 'ae6c04f2-dd83-42a5-825c-c648cd587ea9';

UPDATE public.parts SET images = ARRAY['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600'] WHERE id = 'b624f8cb-8d07-4130-9db9-71d022a5cf0f';

UPDATE public.parts SET images = ARRAY['https://images.unsplash.com/photo-1606554077452-6218c21c94f7?w=600'] WHERE id = 'fd88ec3b-e7fd-4fd9-afa3-a56cefdb84c8';

UPDATE public.parts SET images = ARRAY['https://images.unsplash.com/photo-1619642751034-765dfdf4c7c7?w=600'] WHERE id = '162f009c-9b14-4e87-a337-629cd272771d';

UPDATE public.parts SET images = ARRAY['https://images.unsplash.com/photo-1619684177489-06f4e77c7f41?w=600'] WHERE id = '3c25ecea-8ee0-4d11-b740-d6e98485d3c1';

UPDATE public.parts SET images = ARRAY['https://images.unsplash.com/photo-1613829282765-78f0e7c4e87e?w=600'] WHERE id = 'd968971a-fb47-4235-b5b1-0c6f1adec46c';

UPDATE public.parts SET images = ARRAY['https://images.unsplash.com/photo-1623091409728-c1df4b5e7e5e?w=600'] WHERE id = '8fc14a54-eb9e-4a2d-b83b-6a6f48950ce1';

UPDATE public.parts SET images = ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'] WHERE id = 'ee23e58e-43fe-431a-95c6-850bc39e044a';

UPDATE public.parts SET images = ARRAY['https://images.unsplash.com/photo-1560780551-1b2f2bf8f9d3?w=600'] WHERE id = '25301c32-cc3e-48ed-bdf5-6489caf0c858';

UPDATE public.parts SET images = ARRAY['https://images.unsplash.com/photo-1590362891991-f776e717a973?w=600'] WHERE id = 'b67e2c29-9d3f-46da-8ef6-9f665258740f';

SELECT title, images[1] as image_url FROM public.parts ORDER BY created_at DESC LIMIT 10;