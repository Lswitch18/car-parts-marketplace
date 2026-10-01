import os
from crewai import Agent, Task, Crew, Process, LLM
from textwrap import dedent

gemini_llm = LLM(
    model="gemini/gemini-3.5-flash-lite",
    api_key=os.environ.get("GEMINI_API_KEY")
)

supabase_db_dba = Agent(
    role='Administrador de Banco de Dados e Edge Functions (Root)',
    goal='Corrigir todas as falhas de dependência no Deno e restaurar o pipeline de deploy do Supabase.',
    backstory='Você é o Sysadmin/DBA Sênior do Supabase com acesso root. Você domina Deno, Deno.json, dependências npm dentro do Deno e o CLI do Supabase. O deploy do backend está falhando porque uma dependência (npm:googleapis) não está sendo resolvida no Edge Function `save-to-drive`.',
    verbose=True,
    allow_delegation=True,
    allow_code_execution=True,
    llm=gemini_llm
)

backend_task = Task(
    description=dedent("""
        URGENTE: A esteira CI/CD quebrou no passo "Deploy Supabase Functions" porque o Deno (Edge Functions) não está encontrando os pacotes NPM.
        Erro do log: "Could not find a matching package for 'npm:googleapis@126.0.1' in the node_modules directory. Ensure you have all your JSR and npm dependencies listed in your deno.json or package.json..."
        
        Passos que VOCÊ DEVE EXECUTAR com sua habilidade de execução de código python/bash:
        1. Verificar a pasta `supabase/functions/save-to-drive/`.
        2. Criar ou editar um arquivo `deno.json` dentro da raiz do supabase (ou da function) caso seja necessário ou usar `import_map.json`. Se o projeto usar Deno no Supabase, veja como as deps estão (ex: imports no index.ts).
        3. A documentação mais recente do Supabase Functions com npm recomenda usar um arquivo `supabase/functions/deno.json` para definir `"nodeModulesDir": "auto"` ou rodar um setup de dependência caso precise. Mas o Supabase deploy empacota automaticamente se estiver no padrão.
        4. Outra alternativa rápida é usar esm.sh: trocar `import { google } from "npm:googleapis@126.0.1";` por `import { google } from "https://esm.sh/googleapis@126.0.1";` dentro de `supabase/functions/save-to-drive/index.ts`.
        5. Execute `cat supabase/functions/save-to-drive/index.ts` usando código Python para ler o arquivo e faça o replace da linha do import para usar o esm.sh que o Deno ama nativamente e não precisa de node_modules locais.
        6. Execute o comando local `deno check supabase/functions/save-to-drive/index.ts` para confirmar que compilou.
    """),
    expected_output="As dependências do arquivo index.ts foram corrigidas para rodar perfeitamente no Supabase Edge Functions sem quebrar a pipeline, e o `deno check` passou sem erros.",
    agent=supabase_db_dba
)

backend_crew = Crew(
    agents=[supabase_db_dba],
    tasks=[backend_task],
    process=Process.sequential,
    verbose=True
)

if __name__ == "__main__":
    if not os.environ.get("GEMINI_API_KEY"):
        print("⚠️ ERRO: GEMINI_API_KEY não definida.")
        exit(1)
        
    print("🚀 Iniciando a Crew DBA para resolver as Edge Functions...")
    result = backend_crew.kickoff()
    
    print("\n" + "="*40)
    print("RESULTADO FINAL DA CREW:")
    print("="*40)
    print(result)
