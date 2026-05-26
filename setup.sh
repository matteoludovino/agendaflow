#!/usr/bin/env bash
set -e

echo ""
echo "🚀 Iniciando setup do AgendaFlow..."
echo ""

if ! command -v node &> /dev/null; then
  echo "❌ Node.js não encontrado. Instale a versão 20+ em nodejs.org"
  exit 1
fi

echo "📦 Instalando dependências..."
npm install

echo ""
echo "🎨 Inicializando shadcn/ui..."
npx shadcn@latest init --defaults --yes 2>/dev/null || \
npx shadcn-ui@latest init --defaults --yes

echo ""
echo "➕ Adicionando componentes shadcn/ui..."
COMPONENTS=(
  button card input label badge avatar
  dropdown-menu sheet separator tooltip
  skeleton dialog form select textarea
  tabs popover calendar
)

for component in "${COMPONENTS[@]}"; do
  echo "  → $component"
  npx shadcn@latest add "$component" --yes 2>/dev/null || true
done

echo ""
echo "🗄️  Configurando banco de dados..."

if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo "  ✅ .env.local criado a partir do .env.example"
  echo "  ⚠️  Edite .env.local com suas credenciais antes de continuar"
  echo ""
  read -p "Pressione ENTER após configurar o .env.local..."
fi

echo ""
echo "🔄 Gerando Prisma Client..."
npx prisma generate

echo ""
echo "🗃️  Executando migrations..."
npx prisma migrate dev --name init

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Para iniciar o projeto:"
echo "  npm run dev"
echo ""
echo "Acesse: http://localhost:3000"
echo ""
