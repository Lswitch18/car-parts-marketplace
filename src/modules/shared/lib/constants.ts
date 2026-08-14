export const BRANDS = [
  {
    id: 'nissan',
    name: 'Nissan',
    models: ['180SX', '350Z', '370Z', 'Fairlady Z Z33', 'Fairlady Z Z34', 'GT-R R35', 'Silvia S14', 'Silvia S15', 'Skyline R32', 'Skyline R33', 'Skyline R34', 'Note', 'Dayz', 'Serena', 'Leaf', 'March']
  },
  {
    id: 'toyota',
    name: 'Toyota',
    models: ['AE86 Sprinter Trueno', 'Altezza', 'Celica GT-Four', 'Chaser', 'GR86', 'GT86 / FR-S', 'Mark II', 'MR2 SW20', 'Supra A80', 'Supra GR', 'Prius', 'Aqua', 'Vitz', 'Corolla', 'Yaris', 'Alphard', 'Vellfire', 'HiAce']
  },
  {
    id: 'honda',
    name: 'Honda',
    models: ['Civic', 'Civic Type R EK9', 'Civic Type R EP3', 'Integra Type R', 'NSX NA1', 'NSX NC1', 'Prelude', 'S2000 AP1', 'S2000 AP2', 'S660', 'Fit', 'N-BOX', 'N-VAN', 'N-WGN', 'Freed', 'StepWGN']
  },
  {
    id: 'mazda',
    name: 'Mazda',
    models: ['Mazdaspeed3', 'MX-5 NA', 'MX-5 NB', 'MX-5 NC', 'MX-5 ND', 'RX-7 FC3S', 'RX-7 FD3S', 'RX-8', 'Demio', 'Axela', 'Atenza', 'CX-5']
  },
  {
    id: 'subaru',
    name: 'Subaru',
    models: ['BRZ Z10', 'BRZ ZC6', 'Impreza 22B', 'WRX STI GC8', 'WRX STI GDB', 'WRX STI VAB', 'Levorg', 'Forester', 'Legacy']
  },
  {
    id: 'mitsubishi',
    name: 'Mitsubishi',
    models: ['3000GT / GTO', 'Eclipse', 'FTO', 'Lancer Evo I-V', 'Lancer Evo VI', 'Lancer Evo VII-IX', 'Lancer Evo X', 'Outlander', 'Delica D:5', 'Pajero']
  },
  {
    id: 'suzuki',
    name: 'Suzuki',
    models: ['Swift', 'Wagon R', 'Spacia', 'Carry', 'Jimny', 'Alto', 'Hustler']
  },
  {
    id: 'daihatsu',
    name: 'Daihatsu',
    models: ['Move', 'Tanto', 'Hijet', 'Mira', 'Copen', 'Taft']
  },
  {
    id: 'porsche',
    name: 'Porsche',
    models: ['911', 'Cayman', 'Boxster', 'Panamera', 'Macan', 'Cayenne']
  },
  {
    id: 'bmw',
    name: 'BMW',
    models: ['M3', 'M4', 'M5', '3 Series', '5 Series', 'X5', 'Z4']
  },
  {
    id: 'audi',
    name: 'Audi',
    models: ['RS3', 'RS6', 'R8', 'A4', 'A6', 'Q5', 'TT']
  },
  {
    id: 'tesla',
    name: 'Tesla',
    models: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck']
  }
]

export const CATEGORIES = [
  { id: 'body-kits', name: 'Body Kits', icon: 'Car' },
  { id: 'wings-spoilers', name: 'Wings & Spoilers', icon: 'Triangle' },
  { id: 'wheels-rims', name: 'Wheels & Rims', icon: 'Circle' },
  { id: 'brakes', name: 'Brakes', icon: 'Disc' },
  { id: 'suspension', name: 'Suspension', icon: 'ArrowUpDown' },
  { id: 'engine', name: 'Engine', icon: 'Cylinder' },
  { id: 'exhaust', name: 'Exhaust', icon: 'Wind' },
  { id: 'interior', name: 'Interior', icon: 'Armchair' },
  { id: 'lighting', name: 'Lighting', icon: 'Lightbulb' },
  { id: 'aero', name: 'Aero', icon: 'Waves' },
  { id: 'turbo-boost', name: 'Turbo & Boost', icon: 'Zap' },
  { id: 'cooling', name: 'Cooling', icon: 'Thermometer' }
]

export const CONDITIONS = [
  { id: 'new', label: 'Novo', description: 'Produto novo, na embalagem original' },
  { id: 'used', label: 'Usado', description: 'Produto usado, em boas condições' },
  { id: 'refurbished', label: 'Reformado', description: 'Produto revisado e reformado' }
]

export const YEARS = Array.from({ length: 35 }, (_, i) => 2024 - i)

export const BRAND_UUIDS: Record<string, string> = {
  nissan: '11111111-1111-1111-1111-111111111111',
  toyota: '22222222-2222-2222-2222-222222222222',
  honda: '33333333-3333-3333-3333-333333333333',
  mazda: '44444444-4444-4444-4444-444444444444',
  subaru: '55555555-5555-5555-5555-555555555555',
  mitsubishi: '66666666-6666-6666-6666-666666666666',
  lexus: '77777777-7777-7777-7777-777777777777',
  acura: '88888888-8888-8888-8888-888888888888',
  infiniti: '99999999-9999-9999-9999-999999999999',
  porsche: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  bmw: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
  audi: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  tesla: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  suzuki: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  daihatsu: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
}

export const UUID_TO_BRAND: Record<string, string> = Object.fromEntries(
  Object.entries(BRAND_UUIDS).map(([slug, uuid]) => [uuid, slug])
)

export const MODEL_UUIDS: Record<string, string> = {
  '180SX': '647e62dd-146a-4b78-b09d-183923647297',
  '350Z': 'a412c3a3-b07c-41ad-87b1-186e5ae0a544',
  '370Z': '84b3c097-9e7b-40b9-977b-3962b63c02ba',
  'Fairlady Z Z33': 'd424812b-aae7-419e-9300-ea194616847d',
  'Fairlady Z Z34': 'b88c07b9-a89e-4db8-ad0d-a56fda2835a3',
  'GT-R R35': '277a95db-c5f3-46f3-94bc-114f87d536e1',
  'Silvia S14': '8bdb0730-ff19-4f73-82c5-48c3e624f1f6',
  'Silvia S15': 'e9e83979-4e4a-4b23-9d1a-8c9f5446a611',
  'Skyline R32': '270919b8-4c56-4fb5-b148-9d65d648bc1d',
  'Skyline R33': '97027f9e-071f-4842-9d3b-525cb42f241c',
  'Skyline R34': '3baaf1b9-0a3c-43e3-8f6e-eb6dd789bbb7',
  'AE86 Sprinter Trueno': '7fdce444-d846-47ac-a82c-a03e9dcd5a53',
  'Altezza': 'ea7832b6-bc0f-482f-9a8e-2fe027cafea5',
  'Celica GT-Four': 'f131b9e1-b58e-44a1-9409-8cf278db230b',
  'Chaser': 'cc9030c1-939f-42cd-a213-4f9104b57f69',
  'GR86': '30231834-a561-4c21-9c85-9ca8ef2d6200',
  'GT86 / FR-S': '357cef84-65f6-44cb-9be3-ee59c96ebfc9',
  'Mark II': '4fad0b1f-6421-41a6-a428-7f932a30cc14',
  'MR2 SW20': 'dd9bcc93-70cc-45cd-9c0e-7ac4ead0d844',
  'Supra A80': 'aa2776a3-7c47-4f48-98a6-03f0771a7b5d',
  'Supra GR': '2bb3ddda-4a4e-4a3a-a46f-ce285e3d1f64',
  'Civic Type R EK9': '42995256-9082-4c4f-9677-e731dbf3917f',
  'Civic Type R EP3': 'e4562045-c26b-4397-b4b7-e759e689c1ed',
  'Integra Type R': '7f23dc5b-df3e-4668-a47e-6503f47d110d',
  'NSX NA1': 'c7678578-1446-49bd-834c-3a36e8f76b05',
  'NSX NC1': '3988a1df-42f5-4521-be41-4ac8032963db',
  'Prelude': '3dcf5015-bef4-4af1-b4f8-b8401ce2d04c',
  'S2000 AP1': 'e51bb1b7-87f6-4361-95e1-580a785b5856',
  'S2000 AP2': 'c26af91a-625e-4653-b109-15bcc06c00d1',
  'S660': '8712684d-fcf0-45e2-8381-ac2c25368699',
  'Mazdaspeed3': '4e086743-a344-4ba4-8369-37f0488ccde7',
  'MX-5 NA': 'e8fcd0dc-c847-47dc-9dc1-23efa5ecb9c0',
  'MX-5 NB': '45a226ca-bb61-4208-8d33-7db8423df7ae',
  'MX-5 NC': '129b31a9-31d7-408c-968c-5443de313085',
  'MX-5 ND': 'f0225e14-65e4-4bdd-9464-25e9d5434708',
  'RX-7 FC3S': 'd2e12086-0c6a-4522-bb08-b37442c9b708',
  'RX-7 FD3S': '7424946e-4339-46b4-9273-d3c556202089',
  'RX-8': 'd6b6d08e-c074-4fdc-95c2-65fedc89d274',
  'BRZ Z10': '0ea3feac-5ba2-449e-b013-df71543ba506',
  'BRZ ZC6': '8a9ed5df-8d76-43de-8478-6b1d7a1cf0bd',
  'Impreza 22B': '580363df-f8fd-459a-b6cc-44669b90a9a8',
  'WRX STI GC8': '0124026a-ae4f-493b-b6b1-c913168df07d',
  'WRX STI GDB': '752be2ea-e8f4-4466-84e3-31fbff3742fd',
  'WRX STI VAB': 'ff1f9aed-9d07-49b3-81cb-56d1edc761bb',
  '3000GT / GTO': 'd8fbeb64-561e-4b72-a1c4-5096bc0d2553',
  'Eclipse': 'c857358a-04bd-47c1-8f08-6200c46e5641',
  'FTO': '286717f7-8154-4e85-9bb0-1052269f3561',
  'Lancer Evo I-V': '1bcaf7f9-a64e-4f73-82eb-63bc9ecd244d',
  'Lancer Evo VI': '94c53a97-4799-4e25-8969-509e086f6f35',
  'Lancer Evo VII-IX': '5f23b517-d666-4de9-bdab-b5e3f1d83fd7',
  'Lancer Evo X': '501d0ccf-8d62-4817-b987-1a5eb0ac479b',
}

export const CATEGORY_UUIDS: Record<string, string> = {
  'aero': '11916931-aca3-4dfa-86b2-3c2462d97667',
  'body-kits': 'f6c29df8-8eb9-4910-96e1-8e1c53d5276c',
  'brakes': '383dd03b-4cce-46dd-8bab-da273852e4a7',
  'cooling': '9ef6c897-b83d-4e90-bd54-34caba630862',
  'engine': '0b069287-10e9-4ebc-af65-de6fbffc0373',
  'exhaust': '53a6d6e9-b794-4d21-904d-b630161f3de6',
  'interior': 'bc9c1631-783f-49dd-82e0-a7a758c5546c',
  'lighting': '01521b37-9915-45bf-9d83-34c38ad9f046',
  'suspension': '098a67ef-a49f-4483-84dd-54175c51d971',
  'turbo-boost': '7b19af80-26f4-4346-b13b-33bdd7865bda',
  'wheels-rims': '8c01e7c1-adc9-474d-a88e-65dd5d089962',
  'wings-spoilers': '002ac22c-2a9d-4a08-920c-fc507d53173b',
}