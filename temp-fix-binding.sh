#!/bin/bash

# Временно закомментировать D1 в wrangler.toml
echo "Комментирую D1 bindings в wrangler.toml..."
sed -i.backup 's/^\[\[d1_databases\]\]/# [[d1_databases]]/' wrangler.toml
sed -i.backup 's/^binding = "DB"/# binding = "DB"/' wrangler.toml
sed -i.backup 's/^database_name = "logs-db"/# database_name = "logs-db"/' wrangler.toml
sed -i.backup 's/^database_id = "253b544c-3a8f-4783-8f7f-47df2e6e0096"/# database_id = "253b544c-3a8f-4783-8f7f-47df2e6e0096"/' wrangler.toml

echo "✅ wrangler.toml обновлен"
echo ""
echo "Теперь:"
echo "1. Закоммитьте: git add wrangler.toml && git commit -m 'temp: disable D1 in wrangler.toml' && git push"
echo "2. Дождитесь деплоя (2-3 минуты)"
echo "3. Откройте Dashboard → Settings → Functions → D1 database bindings"
echo "4. Нажмите '+ Add' (теперь должна работать)"
echo "5. Добавьте: Variable name = DB, D1 database = logs-db"
echo "6. Восстановите wrangler.toml: mv wrangler.toml.backup wrangler.toml"
echo "7. Закоммитьте: git add wrangler.toml && git commit -m 'restore wrangler.toml' && git push"

