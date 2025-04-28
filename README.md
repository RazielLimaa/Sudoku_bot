# Robô de Sudoku - Documentação

## Visão Geral

Fiz esse projeto para a  implementação de um robô automático para resolver puzzles de Sudoku usando várias técnicas matemáticas e algoritmos. O programa é executado via terminal e demonstra passo a passo como um Sudoku é resolvido, explicando cada técnica utilizada.

## Como Funciona

### Geração de Puzzles

O robô gera puzzles de Sudoku válidos seguindo estes passos:

1. **Criação de uma solução completa**:
   - Preenche as caixas diagonais 3x3 com números aleatórios
   - Usa backtracking para completar o resto do tabuleiro

2. **Remoção estratégica de números**:
   - Remove números gradualmente, verificando se o puzzle mantém solução única
   - Ajusta a quantidade de números removidos conforme o nível de dificuldade

### Técnicas de Resolução

O robô utiliza as seguintes técnicas para resolver os puzzles:

1. **Solteiros Nus (Naked Singles)**:
   - Identifica células que têm apenas um candidato possível
   - Técnica mais básica e direta

2. **Solteiros Ocultos (Hidden Singles)**:
   - Encontra números que só podem ser colocados em uma posição específica dentro de uma linha, coluna ou caixa
   - Requer análise de todos os candidatos em uma unidade

3. **Pares Nus (Naked Pairs)**:
   - Identifica duas células na mesma unidade (linha, coluna ou caixa) que contêm exatamente os mesmos dois candidatos
   - Elimina esses candidatos de outras células na mesma unidade

4. **Pares/Trios Apontadores (Pointing Pairs/Triples)**:
   - Detecta quando um número candidato em uma caixa 3x3 está restrito a uma única linha ou coluna
   - Elimina esse candidato de outras células na mesma linha ou coluna fora da caixa

5. **Retrocesso (Backtracking)**:
   - Utilizado como último recurso quando técnicas lógicas não são suficientes
   - Faz uma suposição educada e continua a resolução

## Conceitos Matemáticos Aplicados

### 1. Teoria dos Grafos

O Sudoku pode ser modelado como um problema de coloração de grafos:
- Cada célula é um vértice
- Células na mesma linha, coluna ou caixa são conectadas por arestas
- Cada "cor" (número 1-9) deve ser atribuída de forma que vértices adjacentes tenham cores diferentes

### 2. Problemas de Satisfação de Restrições (CSP)

O Sudoku é um CSP clássico com três tipos de restrições:
- Cada célula deve conter exatamente um número
- Cada linha deve conter todos os números de 1 a 9
- Cada coluna deve conter todos os números de 1 a 9
- Cada caixa 3x3 deve conter todos os números de 1 a 9

### 3. Combinatória

- Análise de permutações possíveis para cada célula
- Cálculo de possibilidades para diferentes configurações de candidatos

### 4. Álgebra Booleana

- Representação de candidatos como conjuntos
- Operações de união, interseção e diferença para manipular candidatos

## Estrutura do Código

### Classe `Sudoku`

Responsável pela representação e manipulação do tabuleiro:
- Mantém o estado atual do tabuleiro
- Rastreia candidatos possíveis para cada célula
- Implementa verificações de validade
- Contém métodos para aplicar as diferentes técnicas de resolução

### Classe `SudokuRobot`

Gerencia o processo de resolução automática:
- Controla a velocidade de resolução
- Exibe explicações para cada movimento
- Mantém estatísticas sobre as técnicas utilizadas

### Classe `SudokuApp`

Interface do usuário:
- Apresenta menus para interação
- Gerencia a configuração do robô
- Controla o fluxo do programa

## Glossário de Termos Técnicos

| Termo em Inglês | Tradução em Português |
|-----------------|------------------------|
| Naked Single | Solteiro Nu |
| Hidden Single | Solteiro Oculto |
| Naked Pair | Par Nu |
| Pointing Pair/Triple | Par/Trio Apontador |
| Backtracking | Retrocesso |
| Grid | Grade/Tabuleiro |
| Cell | Célula |
| Row | Linha |
| Column | Coluna |
| Box | Caixa |
| Candidate | Candidato |
| Constraint | Restrição |
| Solver | Solucionador |
| Puzzle | Quebra-cabeça |
| Difficulty | Dificuldade |

## Algoritmos Implementados

### Geração de Puzzles

```
1. Iniciar com um tabuleiro vazio
2. Preencher as três caixas diagonais 3x3 com números aleatórios
3. Resolver o tabuleiro completo usando backtracking
4. Armazenar a solução completa
5. Remover números gradualmente, verificando se o puzzle mantém solução única
6. Ajustar a quantidade de números removidos conforme o nível de dificuldade
```

### Resolução Passo a Passo

```
1. Inicializar candidatos para todas as células vazias
2. Repetir até que o puzzle esteja resolvido:
   a. Procurar por Solteiros Nus
   b. Se não encontrar, procurar por Solteiros Ocultos
   c. Se não encontrar, procurar por Pares Nus
   d. Se não encontrar, procurar por Pares/Trios Apontadores
   e. Se nenhuma técnica lógica funcionar, usar Retrocesso
3. Aplicar a técnica encontrada e atualizar candidatos
4. Exibir explicação e estado atual do tabuleiro
```

## Complexidade Computacional

- **Geração de puzzles**: O(n²) para inicialização, O(9^(n²)) no pior caso para backtracking
- **Verificação de validade**: O(n) para cada verificação de linha, coluna ou caixa
- **Resolução lógica**: Varia de O(n²) para técnicas simples a O(n³) para técnicas mais complexas
- **Backtracking**: O(9^m) no pior caso, onde m é o número de células vazias

## Conclusão

Este robô de Sudoku demonstra como algoritmos matemáticos e técnicas de resolução de restrições podem ser aplicados para resolver problemas complexos. Ao mostrar o processo passo a passo, o programa também serve como uma ferramenta educacional para entender as diferentes estratégias utilizadas por solucionadores humanos de Sudoku.
```

<CodeProject id="sudoku">
