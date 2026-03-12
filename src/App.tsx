import {
  Box,
  Container,
  Grid,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
} from '@chakra-ui/react'
import Papa from 'papaparse'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type SalaryRow = {
  ano: number
  senioridade: string
  contrato: string
  tamanho_empresa: string
  usd: number
  cargo: string
  remoto: string
  residencia_iso3: string
}

type FilterState = {
  anos: string[]
  senioridades: string[]
  contratos: string[]
  tamanhos: string[]
}

type CsvRow = {
  ano?: string
  senioridade?: string
  contrato?: string
  tamanho_empresa?: string
  usd?: string
  cargo?: string
  remoto?: string
  residencia_iso3?: string
}

const DATA_URL =
  'https://raw.githubusercontent.com/vqrca/dashboard_salarios_dados/refs/heads/main/dados-imersao-final.csv'

const pieColors = ['#2b6cb0', '#2f855a', '#d69e2e', '#d53f8c', '#805ad5', '#dd6b20']

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  return (
    <Box>
      <Text fontWeight="semibold" mb={2}>
        {label}
      </Text>
      <select
        multiple
        value={selected}
        onChange={(event) => {
          const values = Array.from(event.target.selectedOptions).map((option) => option.value)
          onChange(values)
        }}
        style={{
          height: '160px',
          width: '100%',
          border: '1px solid #cbd5e0',
          borderRadius: '6px',
          padding: '8px',
          background: '#ffffff',
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Box>
  )
}

function formatCurrency(value: string | number | readonly (string | number)[] | undefined) {
  if (value === undefined) return ''
  const raw = Array.isArray(value) ? value[0] : value
  const numeric = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(numeric)) return value
  return `$${numeric.toLocaleString()}`
}

function App() {
  const [rows, setRows] = useState<SalaryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Papa.parse<CsvRow>(DATA_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed = result.data
          .map((item) => ({
            ano: Number(item.ano ?? 0),
            senioridade: item.senioridade ?? '',
            contrato: item.contrato ?? '',
            tamanho_empresa: item.tamanho_empresa ?? '',
            usd: Number(item.usd ?? 0),
            cargo: item.cargo ?? '',
            remoto: String(item.remoto ?? ''),
            residencia_iso3: item.residencia_iso3 ?? '',
          }))
          .filter((item) => item.ano > 0 && item.usd > 0)

        setRows(parsed)
        setIsLoading(false)
      },
      error: () => {
        setError('Não foi possível carregar os dados.')
        setIsLoading(false)
      },
    })
  }, [])

  const options = useMemo(() => {
    const anos = [...new Set(rows.map((row) => String(row.ano)))].sort()
    const senioridades = [...new Set(rows.map((row) => row.senioridade))].sort()
    const contratos = [...new Set(rows.map((row) => row.contrato))].sort()
    const tamanhos = [...new Set(rows.map((row) => row.tamanho_empresa))].sort()

    return { anos, senioridades, contratos, tamanhos }
  }, [rows])

  const [filters, setFilters] = useState<FilterState>({
    anos: [],
    senioridades: [],
    contratos: [],
    tamanhos: [],
  })

  useEffect(() => {
    if (rows.length > 0) {
      setFilters({
        anos: options.anos,
        senioridades: options.senioridades,
        contratos: options.contratos,
        tamanhos: options.tamanhos,
      })
    }
  }, [rows, options])

  const filtered = useMemo(() => {
    return rows.filter(
      (row) =>
        filters.anos.includes(String(row.ano)) &&
        filters.senioridades.includes(row.senioridade) &&
        filters.contratos.includes(row.contrato) &&
        filters.tamanhos.includes(row.tamanho_empresa),
    )
  }, [rows, filters])

  const metrics = useMemo(() => {
    if (!filtered.length) {
      return {
        salarioMedio: 0,
        salarioMaximo: 0,
        totalRegistros: 0,
        cargoMaisFrequente: '-',
      }
    }

    const salaryTotal = filtered.reduce((sum, row) => sum + row.usd, 0)
    const salaryMax = filtered.reduce((max, row) => (row.usd > max ? row.usd : max), -Infinity)
    const cargoCount = filtered.reduce<Record<string, number>>((acc, row) => {
      acc[row.cargo] = (acc[row.cargo] ?? 0) + 1
      return acc
    }, {})

    const cargoMaisFrequente = Object.entries(cargoCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'

    return {
      salarioMedio: salaryTotal / filtered.length,
      salarioMaximo: salaryMax,
      totalRegistros: filtered.length,
      cargoMaisFrequente,
    }
  }, [filtered])

  const topCargos = useMemo(() => {
    const grouped = filtered.reduce<Record<string, { total: number; count: number }>>((acc, row) => {
      const current = acc[row.cargo] ?? { total: 0, count: 0 }
      current.total += row.usd
      current.count += 1
      acc[row.cargo] = current
      return acc
    }, {})

    return Object.entries(grouped)
      .map(([cargo, value]) => ({ cargo, media: value.total / value.count }))
      .sort((a, b) => b.media - a.media)
      .slice(0, 10)
      .reverse()
  }, [filtered])

  const salaryHistogram = useMemo(() => {
    if (!filtered.length) return []

    const bins = 20
    const min = filtered.reduce((currentMin, row) => (row.usd < currentMin ? row.usd : currentMin), Infinity)
    const max = filtered.reduce((currentMax, row) => (row.usd > currentMax ? row.usd : currentMax), -Infinity)
    const step = Math.max(1, Math.ceil((max - min) / bins))
    const histogram = Array.from({ length: bins }, (_, index) => ({
      faixa: `${(min + index * step).toLocaleString()}-${(min + (index + 1) * step).toLocaleString()}`,
      quantidade: 0,
    }))

    filtered.forEach((row) => {
      const bucket = Math.min(Math.floor((row.usd - min) / step), bins - 1)
      histogram[bucket].quantidade += 1
    })

    return histogram
  }, [filtered])

  const remotoData = useMemo(() => {
    const counts = filtered.reduce<Record<string, number>>((acc, row) => {
      acc[row.remoto] = (acc[row.remoto] ?? 0) + 1
      return acc
    }, {})

    return Object.entries(counts).map(([tipo, quantidade]) => ({ tipo, quantidade }))
  }, [filtered])

  const dsByCountry = useMemo(() => {
    const onlyDs = filtered.filter((row) => row.cargo === 'Data Scientist')
    const grouped = onlyDs.reduce<Record<string, { total: number; count: number }>>((acc, row) => {
      const current = acc[row.residencia_iso3] ?? { total: 0, count: 0 }
      current.total += row.usd
      current.count += 1
      acc[row.residencia_iso3] = current
      return acc
    }, {})

    return Object.entries(grouped)
      .map(([pais, value]) => ({ pais, media: value.total / value.count }))
      .sort((a, b) => b.media - a.media)
      .slice(0, 10)
  }, [filtered])

  if (isLoading) {
    return (
      <Container maxW="7xl" py={16} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Carregando dados...</Text>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxW="7xl" py={16}>
        <Text color="red.500" fontWeight="semibold">
          {error}
        </Text>
      </Container>
    )
  }

  return (
    <Container maxW="7xl" py={8}>
      <Heading size="lg" mb={2}>
        Dashboard de Análise de Salários na Área de Dados
      </Heading>
      <Text color="gray.600" mb={6}>
        Use os filtros para explorar salários por ano, senioridade, contrato e tamanho de empresa.
      </Text>

      <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap={6}>
        <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50" h="fit-content">
          <Heading size="sm" mb={4}>
            Filtros
          </Heading>
          <SimpleGrid columns={1} gap={4}>
            <MultiSelect
              label="Ano"
              options={options.anos}
              selected={filters.anos}
              onChange={(anos) => setFilters((old) => ({ ...old, anos }))}
            />
            <MultiSelect
              label="Senioridade"
              options={options.senioridades}
              selected={filters.senioridades}
              onChange={(senioridades) => setFilters((old) => ({ ...old, senioridades }))}
            />
            <MultiSelect
              label="Tipo de contrato"
              options={options.contratos}
              selected={filters.contratos}
              onChange={(contratos) => setFilters((old) => ({ ...old, contratos }))}
            />
            <MultiSelect
              label="Tamanho da empresa"
              options={options.tamanhos}
              selected={filters.tamanhos}
              onChange={(tamanhos) => setFilters((old) => ({ ...old, tamanhos }))}
            />
          </SimpleGrid>
        </Box>

        <Box>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} mb={6}>
            <Box borderWidth="1px" borderRadius="lg" p={4}>
              <Text color="gray.500" fontSize="sm">
                Salário médio
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                ${metrics.salarioMedio.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Text>
            </Box>
            <Box borderWidth="1px" borderRadius="lg" p={4}>
              <Text color="gray.500" fontSize="sm">
                Salário máximo
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                ${metrics.salarioMaximo.toLocaleString()}
              </Text>
            </Box>
            <Box borderWidth="1px" borderRadius="lg" p={4}>
              <Text color="gray.500" fontSize="sm">
                Total de registros
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {metrics.totalRegistros.toLocaleString()}
              </Text>
            </Box>
            <Box borderWidth="1px" borderRadius="lg" p={4}>
              <Text color="gray.500" fontSize="sm">
                Cargo mais frequente
              </Text>
              <Text fontSize="lg" fontWeight="bold">
                {metrics.cargoMaisFrequente}
              </Text>
            </Box>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, xl: 2 }} gap={6}>
            <Box borderWidth="1px" borderRadius="lg" p={4} h="420px">
              <Heading size="sm" mb={4}>
                Top 10 cargos por salário médio
              </Heading>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={topCargos} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="cargo" width={150} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="media" fill="#2b6cb0" />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box borderWidth="1px" borderRadius="lg" p={4} h="420px">
              <Heading size="sm" mb={4}>
                Distribuição de salários anuais
              </Heading>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={salaryHistogram}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faixa" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#2f855a" />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box borderWidth="1px" borderRadius="lg" p={4} h="420px">
              <Heading size="sm" mb={4}>
                Proporção dos tipos de trabalho
              </Heading>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie data={remotoData} dataKey="quantidade" nameKey="tipo" outerRadius={120} label>
                    {remotoData.map((item, index) => (
                      <Cell key={item.tipo} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <Box borderWidth="1px" borderRadius="lg" p={4} h="420px">
              <Heading size="sm" mb={4}>
                Top países para Data Scientist (média)
              </Heading>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={dsByCountry}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="pais" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="media" fill="#d69e2e" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </SimpleGrid>

          <Box borderWidth="1px" borderRadius="lg" p={4} mt={6} overflowX="auto">
            <Heading size="sm" mb={4}>
              Dados detalhados (primeiras 100 linhas)
            </Heading>
            <Box as="table" w="100%" minW="900px" fontSize="sm" borderCollapse="collapse">
              <Box as="thead" bg="gray.50">
                <Box as="tr">
                  <Box as="th" textAlign="left" p={2}>
                    Ano
                  </Box>
                  <Box as="th" textAlign="left" p={2}>
                    Cargo
                  </Box>
                  <Box as="th" textAlign="left" p={2}>
                    Senioridade
                  </Box>
                  <Box as="th" textAlign="left" p={2}>
                    Contrato
                  </Box>
                  <Box as="th" textAlign="left" p={2}>
                    Tamanho
                  </Box>
                  <Box as="th" textAlign="left" p={2}>
                    Remoto
                  </Box>
                  <Box as="th" textAlign="left" p={2}>
                    País
                  </Box>
                  <Box as="th" textAlign="right" p={2}>
                    Salário USD
                  </Box>
                </Box>
              </Box>
              <Box as="tbody">
                {filtered.slice(0, 100).map((row, index) => (
                  <Box as="tr" key={`${row.cargo}-${row.ano}-${index}`} borderTopWidth="1px">
                    <Box as="td" p={2}>
                      {row.ano}
                    </Box>
                    <Box as="td" p={2}>
                      {row.cargo}
                    </Box>
                    <Box as="td" p={2}>
                      {row.senioridade}
                    </Box>
                    <Box as="td" p={2}>
                      {row.contrato}
                    </Box>
                    <Box as="td" p={2}>
                      {row.tamanho_empresa}
                    </Box>
                    <Box as="td" p={2}>
                      {row.remoto}
                    </Box>
                    <Box as="td" p={2}>
                      {row.residencia_iso3}
                    </Box>
                    <Box as="td" p={2} textAlign="right">
                      ${row.usd.toLocaleString()}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Container>
  )
}

export default App
