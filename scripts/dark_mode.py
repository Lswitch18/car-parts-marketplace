import os

pages_dir = '/home/lswitch/car-parts-marketplce/src/modules/backoffice/pages'
files_to_update = [
    'UserManagement.tsx',
    'TransactionManagement.tsx',
    'ReviewManagement.tsx'
]

for filename in files_to_update:
    filepath = os.path.join(pages_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Replace white theme classes with dark theme classes
        content = content.replace('bg-white', 'bg-[#0A0A0A]')
        content = content.replace('bg-slate-50', 'bg-[#111]')
        content = content.replace('hover:bg-slate-100', 'hover:bg-[#1A1A1A]')
        content = content.replace('hover:bg-slate-50', 'hover:bg-[#111]')
        content = content.replace('text-black', 'text-[#EDEDED]')
        content = content.replace('border-black', 'border-[#333]')
        
        with open(filepath, 'w') as f:
            f.write(content)

# Fix LogistixDashboard
log_path = '/home/lswitch/car-parts-marketplce/src/modules/logistics/pages/LogistixDashboard.tsx'
if os.path.exists(log_path):
    with open(log_path, 'r') as f:
        content = f.read()

    # Fix responsiveness negative margins and chart dimensions
    content = content.replace(
        'flex h-[calc(100vh-8rem)] bg-transparent text-text font-sans overflow-hidden relative antialiased -m-8', 
        'flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-6rem)] bg-transparent text-text font-sans overflow-hidden relative antialiased -m-4 md:-m-6 lg:-m-8'
    )
    content = content.replace(
        'relative h-[180px] flex items-center justify-center min-w-0', 
        'relative h-[180px] w-full min-h-[180px] flex items-center justify-center'
    )
    content = content.replace(
        'h-[180px] min-w-0', 
        'h-[180px] w-full min-h-[180px]'
    )

    with open(log_path, 'w') as f:
        f.write(content)
