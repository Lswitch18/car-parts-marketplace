import os
from crewai import Agent, Task, Crew, Process
from textwrap import dedent
from langchain_google_genai import ChatGoogleGenerativeAI

# Configurando o Gemini como o LLM (Cérebro) dos Agentes
# Certifique-se de que a variável de ambiente GEMINI_API_KEY está configurada
gemini_llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    verbose=True,
    temperature=0.7,
    google_api_key=os.environ.get("GEMINI_API_KEY")
)

# Definição dos Agentes do Time iOS
ios_builder = Agent(
    role='Engenheiro Chefe iOS e DevOps',
    goal='Garantir que a compilação do App iOS passe no GitHub Actions e funcione no Appetize.io sem erros.',
    backstory=dedent("""
        Você é um engenheiro mobile experiente. Você parou de usar AWS e agora foca em 
        compilações automatizadas usando macos-14 no GitHub Actions. Você odeia perder 
        logs de erro e sempre documenta falhas em arquivos locais antes de consertar.
    """),
    verbose=True,
    allow_delegation=True,
    llm=gemini_llm
)

ui_designer = Agent(
    role='Especialista UX/UI & GSAP',
    goal='Garantir animações em 60/120fps e padrão Cyber Neon no React/Capacitor.',
    backstory=dedent("""
        Você é obcecado por performance visual. Trabalha lado a lado com o Engenheiro iOS 
        para garantir que componentes como o BrandLoader.tsx fiquem perfeitos no simulador.
    """),
    verbose=True,
    allow_delegation=False,
    llm=gemini_llm
)

security_engineer = Agent(
    role='Engenheiro de Segurança (Shift-Left)',
    goal='Validar vazamentos de env vars e proteção de chaves Stripe/Supabase no build.',
    backstory=dedent("""
        Você verifica os logs do GitHub Actions e o payload do .ipa para garantir 
        que nenhuma VITE_SUPABASE_ANON_KEY exponha dados sensíveis além do necessário.
    """),
    verbose=True,
    allow_delegation=False,
    llm=gemini_llm
)

# Definição das Tarefas
debug_appetize_task = Task(
    description=dedent("""
        Temos um erro de log não documentado no Appetize.io que ocorreu na sessão anterior. 
        1. Crie um arquivo de estado físico do erro.
        2. Revise o workflow do GitHub Actions (.github/workflows/ios-build.yml).
        3. Proponha a correção para as variáveis .env que falharam no build.
    """),
    expected_output="Um relatório documentado e o código corrigido para o fluxo do GitHub Actions.",
    agent=ios_builder
)

# Montando a Crew (Equipe)
ios_crew = Crew(
    agents=[ios_builder, ui_designer, security_engineer],
    tasks=[debug_appetize_task],
    process=Process.sequential, # As tarefas são executadas em ordem
    verbose=True
)

if __name__ == "__main__":
    print("🚀 Iniciando a Crew de Desenvolvimento iOS DAIG (Powered by Gemini)...")
    if not os.environ.get("GEMINI_API_KEY"):
        print("⚠️ ERRO: A variável de ambiente GEMINI_API_KEY não está configurada.")
        print("Exporte sua chave antes de rodar: export GEMINI_API_KEY='sua-chave-aqui'")
        exit(1)
        
    result = ios_crew.kickoff()
    print("\n######################")
    print("RESULTADO DA CREW:")
    print("######################")
    print(result)
