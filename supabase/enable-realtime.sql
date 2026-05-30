-- Habilita o realtime para a tabela de lances (bids) e de peças (parts)
alter publication supabase_realtime add table bids;
alter publication supabase_realtime add table parts;
