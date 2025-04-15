<?php
ob_clean(); // Limpia el buffer de salida (por si algo se coló antes)

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(0);// Habilitar CORS correctamente
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Recibir JSON
$inputJSON = file_get_contents("php://input");
$input = json_decode($inputJSON, true);

// Validar
if (!$input || !isset($input['tableName']) || !isset($input['columns'])) {
    http_response_code(400);
    echo json_encode(["error" => "Datos inválidos"]);
    exit();
}

// Respuesta válida
echo json_encode([
    "message" => "Datos recibidos correctamente",
    "data" => $input
]);

// Función para enviar respuestas JSON  
function sendJsonResponse($success, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        "success" => $success,
        "message" => $message,
        "data" => $data
    ]);     
    exit();
}
// Capturar el contenido de entrada para depuración
//$input = file_get_contents('php://input');
file_put_contents('php_input_log.txt', $input); // Guarda el contenido recibido en un archivo
$data = json_decode($input, true);

if (!$data || !isset($data['tableName']) || !isset($data['columns'])) {
    sendJsonResponse(false, "Datos de entrada no válidos o incompletos.");
    
}

$tableName = $data['tableName'];
$columns = array_map(function($col) {
    return [$col['name'], $col['type']];
}, $data['columns']);


$templateGlobalPath = 'C:/xampp/htdocs/codigophp/core/templates/frontend-crud';
$templateModulePath = 'C:/xampp/htdocs/codigophp/core/templates/frontend-crud/src/app/productos';
$outputPath = 'C:/xampp/htdocs/codigophp/output';
if (!is_writable($outputPath)) {

    sendJsonResponse(false, "El directorio de salida no tiene permisos de escritura.");
}




// Lista de nom        es de módulos que deseas generar
$moduleNames =  [$data['tableName']];
$input = file_get_contents('php://input');
$data = json_decode($input, true);



//$columns = [
  //  ['id', 'int'],
    //['nombre', 'String'],
  //  ['precio', 'int'],
   // ['codigoBarras', 'String'],
    //['cantidad', 'int'],
   // ['categoria', 'String'],
   // ['proveedor', 'String'],
   // ['enStock', 'boolean'],
   // ['descripcion', 'String'],
//];
  //$json = json_encode($columns, JSON_PRETTY_PRINT);

  function generateModelConfig($baseName) {
    $capitalized = ucfirst($baseName);

    return [
        'Entidad' => $capitalized,
        'Entid' => $capitalized,
        'entid' => strtolower($baseName),
        'entids' => strtolower($baseName),
        'Entids' => $capitalized,
        'entidad' => strtolower($baseName),
        'entidades' => strtolower($baseName),
        'Entidades' => $capitalized
    ];
}

function createOutputFolder($outputPath) {
    if (!file_exists($outputPath)) {
        mkdir($outputPath, 0777, true);
        return "Carpeta principal creada: $outputPath";
    } else {
        return "La carpeta principal ya existe: $outputPath";
    }
}


function createAngularProjectStructure($templatePath, $outputPath) {
    $excludeDirs = ['.git', '.angular', '.idea', 'headphones', 'productos', 'node_modules', '.vscode'];
    $excludeFiles = ['.editorconfig', '.gitignore'];

    $directoryIterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($templatePath, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($directoryIterator as $item) {
        foreach ($excludeDirs as $dir) {
            if (str_contains($item->getPathname(), $dir)) {
                continue 2;
            }
        }

        foreach ($excludeFiles as $file) {
            if (str_contains($item->getFilename(), $file)) {
                continue 2;
            }
        }

        $targetPath = $outputPath . '/' . $directoryIterator->getSubPathName();

        if ($item->isDir()) {
            if (!file_exists($targetPath)) {
                mkdir($targetPath, 0777, true);
                return "Carpeta creada: $targetPath\n";
            }
        } else {
            copy($item, $targetPath);
            return "Archivo copiado: $targetPath\n";
        }
    }
}

function generateModuleFiles($inputDir, $outputDir, $config, $columns, $moduleName) {
    $moduleDir = $outputDir . '/src/app/' . $config['entidades'];
    if (!file_exists($moduleDir)) {
        mkdir($moduleDir, 0777, true);
    }

    $files = scandir($inputDir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;

        $inputPath = $inputDir . '/' . $file;
        $outputFileName = str_replace('productos', $moduleName, $file);
        if (str_contains($file, 'producto.model.ts')) {
            $outputFileName = "{$moduleName}.model.ts";
        }
        $outputFileName = preg_replace('/\.template\.(ts|html|css)$/', ".$1", $outputFileName);
        $outputPath = $moduleDir . '/' . $outputFileName;

        if (is_file($inputPath)) {
            $content = file_get_contents($inputPath);
            foreach ($config as $key => $value) {
                $content = str_replace("{" . $key . "}", $value, $content);
            }

            // Procesar columnas para {COLUMNS} en el model.ts
            if (str_contains($content, '{COLUMNS}')) {
                $modelColumns = array_map(function ($column) {
                    return "  " . $column[0] . ": " . ($column[1] === 'int' ? 'number' : strtolower($column[1])) . ";";
                }, $columns);
                $content = str_replace("{COLUMNS}", implode("\n", $modelColumns), $content);
            }

            // Procesar columnas para {EMPTY_COLUMNS} en el component.ts
            if (str_contains($content, '{EMPTY_COLUMNS}')) {
                $emptyColumns = generateEmptyComponentColumns($columns);
                $content = str_replace("{EMPTY_COLUMNS}", $emptyColumns, $content);
            }

            // **Agregar soporte para paginación en component.ts**
            if (str_contains($content, '/* PAGINATION_PLACEHOLDER */') && !str_contains($content, 'updatePagination()')) {
                $paginationCode = <<<TS
  itemsPerPage: number = 5;
  currentPage: number = 1;
  paginated{Entids}: {Entid}[] = [];
  filtered{Entids}: {Entid}[] = [];
  searchTerm: string = '';

  applyFilters() {
    this.filtered{Entids} = this.searchTerm
      ? this.{entids}.filter(item => 
          item?.nombre && item.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      : [...this.{entids}];
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginated{Entids} = this.filtered{Entids}.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filtered{Entids}.length / this.itemsPerPage);
  }
TS;

                $content = str_replace('/* PAGINATION_PLACEHOLDER */', $paginationCode, $content);
            }

            // **Agregar paginación en HTML**
            if (str_contains($content, '<!-- PAGINATION_PLACEHOLDER -->') && !str_contains($content, 'currentPage')) {
                $paginationHtml = <<<HTML
<div class="paginacion">
  <button [disabled]="currentPage === 1" (click)="previousPage()">Anterior</button>
  <span>Página {{ currentPage }} de {{ totalPages }}</span>
  <button [disabled]="currentPage === totalPages" (click)="nextPage()">Siguiente</button>
</div>
HTML;

                $content = str_replace('<!-- PAGINATION_PLACEHOLDER -->', $paginationHtml, $content);
            }


            if (preg_match('/\{[A-Za-z]+}/', $content)) {
                return "Advertencia: Existen placeholders sin reemplazar en $outputPath\n";
            }

            if (!file_exists(dirname($outputPath))) {
                mkdir(dirname($outputPath), 0777, true);
            }

            file_put_contents($outputPath, $content);
            return "Archivo generado: $outputPath\n";
        }
    }
}





function generateModelColumns($columns) {
    $content = [];
    foreach ($columns as $column) {
        $type = match (strtolower($column[1])) {
            'string' => 'string',
            'int', 'float', 'double', 'number' => 'number',
            'boolean' => 'boolean',
            default => 'string'
        };
        $content[] = "  {$column[0]}: {$type};";
    }
    return implode("\n", $content);
}


function generateEmptyComponentColumns($columns) {
    $content = [];
    foreach ($columns as $column) {
        $defaultValue = match (strtolower($column[1])) {
            'string' => "''",
            'int', 'number', 'float', 'double' => '0',
            'boolean' => 'false',
            default => "''"
        };
        $content[] = "      {$column[0]}: {$defaultValue}";
    }
    return implode(",\n", $content);
}
function addUniqueImport($content, $importStatement) {
    // Extraer todos los imports actuales
    preg_match_all('/^import .*?;$/m', $content, $matches);
    $existingImports = $matches[0] ?? [];

    // Verificar si el import ya existe y evitar duplicados
    if (!in_array(trim($importStatement), array_map('trim', $existingImports))) {
        $existingImports[] = $importStatement; // Añadir solo si no existe
    }

    // Ordenar y consolidar los imports
    sort($existingImports);

    // Eliminar todos los imports del contenido original
    $contentWithoutImports = preg_replace('/^import .*?;$/m', '', $content);

    // Reescribir los imports únicos
    return implode("\n", $existingImports) . "\n\n" . ltrim($contentWithoutImports);
}


function consolidateImports($content) {
    // Extraer todos los imports únicos
    preg_match_all('/^import .*?;$/m', $content, $matches);
    $uniqueImports = array_unique($matches[0] ?? []);

    // Ordenar los imports alfabéticamente
    sort($uniqueImports);

    // Eliminar todos los imports existentes del contenido original
    $contentWithoutImports = preg_replace('/^import .*?;$/m', '', $content);

    // Reescribir los imports únicos al principio del archivo
    return implode("\n", $uniqueImports) . "\n\n" . ltrim($contentWithoutImports);
}

function updateAngularFiles($outputPath, $config, $isFirstModule = false) {
    $filesToUpdate = [
        'routes' => $outputPath . '/src/app/app.routes.ts',
        'sidebar' => $outputPath . '/src/app/sidebar.component.html',
        'appComponent' => $outputPath . '/src/app/app.component.ts',
    ];

    foreach ($filesToUpdate as $type => $filePath) {
        if (!file_exists($filePath)) {
            echo "Archivo no encontrado: $filePath\n";
            continue;
        }

        $content = file_get_contents($filePath);

        switch ($type) {
            case 'routes':
                $moduleSectionStart = "// MODULES START";
                $moduleSectionEnd = "// MODULES END";

                // Asegurar delimitadores
                if (!str_contains($content, $moduleSectionStart)) {
                    $content = preg_replace('/\];/', "$moduleSectionStart\n$moduleSectionEnd\n];", $content);
                }

                // Reemplazar placeholders antes de generar el contenido
                $content = str_replace(['{entidades}', '{Entidades}'], [$config['entidades'], $config['Entidades']], $content);

                // Generar nueva ruta
                $newRoute = "  { path: '{$config['entidades']}', component: {$config['Entidades']}Component }";
                if (!str_contains($content, "path: '{$config['entidades']}'")) {
                    $content = preg_replace(
                        '/' . preg_quote($moduleSectionStart, '/') . '(.*?)' . preg_quote($moduleSectionEnd, '/') . '/s',
                        "$moduleSectionStart\n$newRoute\n$1$moduleSectionEnd",
                        $content
                    );
                    echo "Ruta añadida en app.routes.ts\n";
                }

                // Añadir el import del componente sin duplicados
                $importStatement = "import { {$config['Entidades']}Component } from './{$config['entidades']}/{$config['entidades']}.component';";
                $content = addUniqueImport($content, $importStatement);

                break;


            case 'sidebar':
                $newLink = "    <li><a routerLink=\"/{$config['entidades']}\">{$config['Entidades']}</a></li>";
                if (!str_contains($content, "routerLink=\"/{$config['entidades']}\"")) {
                    $content = preg_replace('/<\/ul>/', "$newLink\n</ul>", $content);
                    echo "Enlace añadido en sidebar.component.html\n";
                }
                break;


            case 'appComponent':
                // Añadir el import del componente sin duplicados
                $importStatement = "import { {$config['Entidades']}Component } from './{$config['entidades']}/{$config['entidades']}.component';";
                $content = addUniqueImport($content, $importStatement);

                // Añadir componente al array de imports si no existe
                $componentImport = "{$config['Entidades']}Component";
                if (!preg_match('/imports: \[.*?\b' . preg_quote($componentImport, '/') . '\b.*?\]/s', $content)) {
                    $content = preg_replace(
                        '/imports: \[(.*?)\]/s',
                        "imports: [\$1, $componentImport]",
                        $content
                    );
                    echo "Componente añadido al array de imports en app.component.ts\n";
                }
                break;

            default:
                echo "Tipo de archivo no reconocido: $type\n";
        }

        // Consolidar y reescribir los imports al final
        $content = consolidateImports($content);
        file_put_contents($filePath, $content);
    }
}





function runNpmInstall($outputPath) {
    chdir($outputPath);
    exec('npm install', $output, $returnVar);
    return $returnVar === 0 ? "npm install ejecutado correctamente." : "Error al ejecutar npm install.";
}

try {
    // Crear la carpeta de salida
    $createFolderMessage = createOutputFolder($outputPath);

    // Crear la estructura del proyecto
    createAngularProjectStructure($templateGlobalPath, $outputPath);

    $isFirstModule = true;
    foreach ($moduleNames as $moduleName) {
        $config = generateModelConfig($moduleName);
        generateModuleFiles($templateModulePath, $outputPath, $config, $columns, $moduleName);
        updateAngularFiles($outputPath, $config, $isFirstModule);
        $isFirstModule = false;
    }

    // Ejecutar npm install
    $npmMessage = runNpmInstall($outputPath);

    // Enviar respuesta JSON con el mensaje de éxito
    sendJsonResponse(true, "Proyecto Angular generado exitosamente.", [
        "folder" => $createFolderMessage,
        "npm" => $npmMessage,
        "tableName" => $tableName,
    "columns" => $columns    
    ]);
} catch (Exception $e) {
    sendJsonResponse(false, "Error al generar el proyecto: " . $e->getMessage());
}
exit();
?>
