import { Search } from "lucide-react";
import { Input, Select } from "../common/field";
import { CONTENT_TYPES } from "../../util/constants";
import { cn } from "../../util/cn";

/**
 * GenerationFilters — barra de filtros do acervo.
 * Busca textual, filtro por empresa e chips de tipo (single + "Todos").
 * Empilha em telas estreitas via history.css.
 */
export default function GenerationFilters({
  query,
  onQuery,
  companyFilter,
  onCompany,
  typeFilter,
  onType,
  companies = [],
}) {
  return (
    <div className="hist-filters">
      <div className="hist-filters-row">
        <div className="hist-search">
          <Input
            label="Buscar"
            type="search"
            inputMode="search"
            placeholder="Buscar por briefing ou empresa…"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            aria-label="Buscar no histórico"
          />
          <span className="hist-search-icon" aria-hidden>
            <Search size={16} />
          </span>
        </div>

        <Select
          label="Empresa"
          value={companyFilter}
          onChange={(e) => onCompany(e.target.value)}
        >
          <option value="">Todas as empresas</option>
          {companies.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="hist-chips" role="group" aria-label="Filtrar por tipo de conteúdo">
        <span className="hist-chips-label">Tipo</span>

        <button
          type="button"
          className={cn("chip", "hist-chip", typeFilter === "" && "selected")}
          aria-pressed={typeFilter === ""}
          onClick={() => onType("")}
        >
          Todos
        </button>

        {CONTENT_TYPES.map((t) => {
          const Icon = t.icon;
          const active = typeFilter === t.value;
          return (
            <button
              key={t.value}
              type="button"
              className={cn("chip", "hist-chip", active && "selected")}
              aria-pressed={active}
              onClick={() => onType(active ? "" : t.value)}
            >
              {Icon && <Icon size={13} aria-hidden />}
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
