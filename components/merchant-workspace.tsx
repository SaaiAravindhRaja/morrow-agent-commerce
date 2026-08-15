"use client";

import {
  ArrowLeft,
  ArrowSquareOut,
  CheckCircle,
  Clock,
  Code,
  Copy,
  DotsThree,
  Flask,
  Funnel,
  Gear,
  HandCoins,
  HouseLine,
  Info,
  MagnifyingGlass,
  Package,
  Pause,
  PencilSimple,
  Play,
  Plus,
  Pulse,
  Receipt,
  ShieldCheck,
  Storefront,
  Wallet,
} from "@phosphor-icons/react";
import { FormEvent, useMemo, useState } from "react";

import { CommerceStage } from "@/components/commerce-stage";
import { formatXsgd } from "@/lib/commerce";
import {
  ALLOCATION_LABELS,
  CATEGORY_LABELS,
  COMMITMENT_POLICIES,
  DEFAULT_POLICY_DRAFT,
  compilePolicy,
  parseSgdToAtomic,
  policyFromDraft,
  policyValidationErrors,
  type CommitmentPolicy,
  type PolicyDraft,
  type PolicyStatus,
} from "@/lib/policies";

type Section = "overview" | "commitments" | "catalog" | "activity" | "settings";
type CommitmentView = "list" | "detail" | "editor";
type DetailTab = "overview" | "proof" | "agent";

const NAV_ITEMS = [
  { id: "overview" as const, label: "Overview", icon: HouseLine },
  { id: "commitments" as const, label: "Commitments", icon: HandCoins },
  { id: "catalog" as const, label: "Catalog", icon: Package },
  { id: "activity" as const, label: "Activity", icon: Pulse },
  { id: "settings" as const, label: "Settings", icon: Gear },
];

const ACTIVITY = [
  { title: "Commitment exercised", detail: "Atlas · Friday dinner commitment", time: "2 min ago", kind: "success" },
  { title: "Losing authorization discarded", detail: "Nova · balance delta 0.00 XSGD", time: "2 min ago", kind: "neutral" },
  { title: "Policy published", detail: "Chef's counter release", time: "Yesterday", kind: "neutral" },
  { title: "Commitment expired", detail: "Friday dinner commitment · fee retained", time: "Aug 14", kind: "warning" },
];

function statusLabel(status: PolicyStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function draftFromPolicy(policy: CommitmentPolicy): PolicyDraft {
  return {
    name: policy.name,
    item: policy.item,
    category: policy.category,
    feeSgd: (Number(policy.feeAtomic) / 1_000_000).toFixed(2),
    durationMinutes: policy.durationMinutes,
    exerciseWindowMinutes: policy.exerciseWindowMinutes,
    capacity: policy.capacity,
    allocationRule: policy.allocationRule,
    creditOnExercise: policy.creditOnExercise,
    terms: policy.terms,
  };
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function StatusBadge({ status }: { status: PolicyStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}><i />{statusLabel(status)}</span>;
}

export function MerchantWorkspace() {
  const [section, setSection] = useState<Section>("commitments");
  const [view, setView] = useState<CommitmentView>("list");
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [policies, setPolicies] = useState<CommitmentPolicy[]>(COMMITMENT_POLICIES);
  const [selectedId, setSelectedId] = useState(COMMITMENT_POLICIES[0].id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PolicyStatus | "ALL">("ALL");
  const [draft, setDraft] = useState<PolicyDraft>(DEFAULT_POLICY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedPolicy = policies.find((policy) => policy.id === selectedId) ?? policies[0];
  const filteredPolicies = policies.filter((policy) => {
    const query = search.trim().toLowerCase();
    const matchesQuery = !query || `${policy.name} ${policy.item} ${policy.sku}`.toLowerCase().includes(query);
    return matchesQuery && (statusFilter === "ALL" || policy.status === statusFilter);
  });
  const activePolicies = policies.filter((policy) => policy.status === "ACTIVE");
  const claimed = policies.reduce((sum, policy) => sum + policy.claimed, 0);
  const exercised = policies.reduce((sum, policy) => sum + policy.exercised, 0);
  const draftErrors = policyValidationErrors(draft);

  const previewPolicy = useMemo(() => {
    if (draftErrors.length) return null;
    try {
      return policyFromDraft(draft, editingId ?? "policy-preview");
    } catch {
      return null;
    }
  }, [draft, editingId, draftErrors.length]);

  function navigate(next: Section) {
    setSection(next);
    setNotice(null);
    if (next === "commitments") setView("list");
  }

  function openPolicy(policy: CommitmentPolicy, tab: DetailTab = "overview") {
    setSelectedId(policy.id);
    setDetailTab(tab);
    setView("detail");
    setSection("commitments");
  }

  function startCreate() {
    setDraft(DEFAULT_POLICY_DRAFT);
    setEditingId(null);
    setView("editor");
    setSection("commitments");
    setNotice(null);
  }

  function startEdit(policy: CommitmentPolicy) {
    setDraft(draftFromPolicy(policy));
    setEditingId(policy.id);
    setView("editor");
    setNotice(null);
  }

  function publishPolicy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draftErrors.length) {
      setNotice(draftErrors[0]);
      return;
    }

    const next = policyFromDraft(draft, editingId ?? `policy-${policies.length + 1}`);
    setPolicies((current) => editingId
      ? current.map((policy) => policy.id === editingId ? { ...next, claimed: policy.claimed, exercised: policy.exercised } : policy)
      : [next, ...current]);
    setSelectedId(next.id);
    setDetailTab("overview");
    setView("detail");
    setNotice(editingId ? "Commitment updated" : "Commitment published");
  }

  function togglePolicy(policy: CommitmentPolicy) {
    const nextStatus = policy.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    setPolicies((current) => current.map((item) => item.id === policy.id ? { ...item, status: nextStatus, updatedAt: "Just now" } : item));
    setNotice(nextStatus === "ACTIVE" ? "Commitment resumed" : "Commitment paused");
  }

  async function copyTerms(policy: CommitmentPolicy) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(compilePolicy(policy), null, 2));
      setNotice("Agent terms copied");
    } catch {
      setNotice("Copy unavailable in this browser");
    }
  }

  return (
    <div className="merchant-app">
      <aside className="app-sidebar">
        <button className="brand" type="button" onClick={() => navigate("commitments")} aria-label="Morrow commitments">
          MORROW<span>.</span>
        </button>
        <nav aria-label="Merchant workspace">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} type="button" data-active={section === item.id} onClick={() => navigate(item.id)}>
                <Icon size={19} weight={section === item.id ? "fill" : "regular"} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="merchant-switcher" aria-label="Current merchant">
          <span className="merchant-avatar">AB</span>
          <span><small>Merchant</small><strong>Atlas Bistro</strong></span>
        </div>
      </aside>

      <div className="app-body">
        <header className="mobile-header">
          <button className="brand" type="button" onClick={() => navigate("commitments")}>MORROW<span>.</span></button>
          <span>Atlas Bistro</span>
        </header>

        <nav className="mobile-nav" aria-label="Merchant workspace mobile navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} type="button" data-active={section === item.id} onClick={() => navigate(item.id)} aria-label={item.label}>
                <Icon size={20} weight={section === item.id ? "fill" : "regular"} aria-hidden="true" />
              </button>
            );
          })}
        </nav>

        {notice ? (
          <button className="toast" type="button" onClick={() => setNotice(null)} aria-live="polite">
            <CheckCircle size={18} weight="fill" aria-hidden="true" />{notice}
          </button>
        ) : null}

        <main className="workspace">
          {section === "overview" ? (
            <OverviewSection policies={policies} onOpen={openPolicy} onCreate={startCreate} claimed={claimed} exercised={exercised} />
          ) : null}

          {section === "commitments" && view === "list" ? (
            <CommitmentList
              policies={filteredPolicies}
              allPolicies={policies}
              activeCount={activePolicies.length}
              claimed={claimed}
              exercised={exercised}
              search={search}
              statusFilter={statusFilter}
              onSearch={setSearch}
              onFilter={setStatusFilter}
              onCreate={startCreate}
              onOpen={openPolicy}
            />
          ) : null}

          {section === "commitments" && view === "detail" && selectedPolicy ? (
            <CommitmentDetail
              policy={selectedPolicy}
              tab={detailTab}
              onTab={setDetailTab}
              onBack={() => setView("list")}
              onEdit={() => startEdit(selectedPolicy)}
              onToggle={() => togglePolicy(selectedPolicy)}
              onCopy={() => copyTerms(selectedPolicy)}
            />
          ) : null}

          {section === "commitments" && view === "editor" ? (
            <PolicyEditor
              draft={draft}
              errors={draftErrors}
              preview={previewPolicy}
              editing={Boolean(editingId)}
              onDraft={setDraft}
              onCancel={() => editingId && selectedPolicy ? setView("detail") : setView("list")}
              onSubmit={publishPolicy}
            />
          ) : null}

          {section === "catalog" ? <CatalogSection policies={policies} onCreate={startCreate} /> : null}
          {section === "activity" ? <ActivitySection /> : null}
          {section === "settings" ? <SettingsSection /> : null}
        </main>
      </div>
    </div>
  );
}

function PageHeader({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) {
  return (
    <header className="page-header">
      <div><h1>{title}</h1><p>{description}</p></div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

function OverviewSection({
  policies,
  onOpen,
  onCreate,
  claimed,
  exercised,
}: {
  policies: CommitmentPolicy[];
  onOpen: (policy: CommitmentPolicy, tab?: DetailTab) => void;
  onCreate: () => void;
  claimed: number;
  exercised: number;
}) {
  return (
    <>
      <PageHeader
        title="Overview"
        description="Your commitment products and settlement activity at a glance."
        actions={<button className="button button-primary" type="button" onClick={onCreate}><Plus size={17} weight="bold" />Create commitment</button>}
      />
      <section className="metrics-row" aria-label="Merchant summary">
        <Metric label="Active policies" value={String(policies.filter((policy) => policy.status === "ACTIVE").length)} note="Machine-readable offers" />
        <Metric label="Commitments acquired" value={String(claimed)} note="Across all inventory" />
        <Metric label="Exercise rate" value={claimed ? `${Math.round((exercised / claimed) * 100)}%` : "0%"} note={`${exercised} credited on exercise`} />
        <Metric label="Loser charges" value="S$0.00" note="Authorization discarded" />
      </section>
      <div className="overview-grid">
        <section className="surface recent-panel">
          <div className="surface-header"><div><h2>Recent commitments</h2><p>Policies with the latest merchant activity.</p></div><button type="button" onClick={() => onOpen(policies[0])}>View all</button></div>
          <div className="compact-list">
            {policies.slice(0, 3).map((policy) => (
              <button type="button" key={policy.id} onClick={() => onOpen(policy)}>
                <span className={`category-mark category-${policy.category.toLowerCase()}`}>{policy.sku.slice(0, 2)}</span>
                <span><strong>{policy.name}</strong><small>{policy.item}</small></span>
                <StatusBadge status={policy.status} />
              </button>
            ))}
          </div>
        </section>
        <section className="surface health-panel">
          <div className="surface-header"><div><h2>Agent checkout</h2><p>How autonomous buyers interact with your offers.</p></div></div>
          <ul className="readiness-list">
            <li><CheckCircle weight="fill" /><span><strong>Offer discovery</strong><small>Catalog, terms, and availability</small></span></li>
            <li><CheckCircle weight="fill" /><span><strong>Commitment payment</strong><small>Clear XSGD pricing for every offer</small></span></li>
            <li><CheckCircle weight="fill" /><span><strong>Inventory protection</strong><small>Only allocated offers are settled</small></span></li>
          </ul>
        </section>
      </div>
    </>
  );
}

function CommitmentList({
  policies,
  allPolicies,
  activeCount,
  claimed,
  exercised,
  search,
  statusFilter,
  onSearch,
  onFilter,
  onCreate,
  onOpen,
}: {
  policies: CommitmentPolicy[];
  allPolicies: CommitmentPolicy[];
  activeCount: number;
  claimed: number;
  exercised: number;
  search: string;
  statusFilter: PolicyStatus | "ALL";
  onSearch: (value: string) => void;
  onFilter: (value: PolicyStatus | "ALL") => void;
  onCreate: () => void;
  onOpen: (policy: CommitmentPolicy, tab?: DetailTab) => void;
}) {
  const retained = allPolicies.reduce((sum, policy) => sum + Math.max(0, policy.claimed - policy.exercised) * Number(policy.feeAtomic), 0);
  return (
    <>
      <PageHeader
        title="Commitments"
        description="Turn scarce inventory into machine-readable offers with clear payment rules."
        actions={
          <button className="button button-primary" type="button" onClick={onCreate}><Plus size={17} weight="bold" />Create commitment</button>
        }
      />
      <section className="metrics-row" aria-label="Commitment summary">
        <Metric label="Active" value={String(activeCount)} note={`${allPolicies.length} total policies`} />
        <Metric label="Acquired" value={String(claimed)} note={`${exercised} exercised`} />
        <Metric label="Exercise rate" value={claimed ? `${Math.round((exercised / claimed) * 100)}%` : "0%"} note="Fees credited to orders" />
        <Metric label="Retained on expiry" value={formatXsgd(BigInt(retained))} note="Non-refundable policy" />
      </section>

      <section className="surface table-surface">
        <div className="table-toolbar">
          <label className="search-field">
            <MagnifyingGlass size={17} aria-hidden="true" />
            <span className="sr-only">Search commitments</span>
            <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search offers, inventory, or SKU" />
          </label>
          <label className="filter-field">
            <Funnel size={16} aria-hidden="true" />
            <span className="sr-only">Filter by status</span>
            <select value={statusFilter} onChange={(event) => onFilter(event.target.value as PolicyStatus | "ALL")}>
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="PAUSED">Paused</option>
            </select>
          </label>
        </div>
        <div className="table-scroll">
          <table className="resource-table">
            <thead><tr><th>Offer</th><th>Status</th><th>Fee</th><th>Capacity</th><th>Allocation</th><th>Updated</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy.id} onClick={() => onOpen(policy)}>
                  <td><button className="resource-name" type="button" onClick={() => onOpen(policy)}><span className={`category-mark category-${policy.category.toLowerCase()}`}>{policy.sku.slice(0, 2)}</span><span><strong>{policy.name}</strong><small>{policy.item} · {policy.sku}</small></span></button></td>
                  <td><StatusBadge status={policy.status} /></td>
                  <td><strong>{formatXsgd(BigInt(policy.feeAtomic))}</strong></td>
                  <td>{policy.claimed} / {policy.capacity}</td>
                  <td>{ALLOCATION_LABELS[policy.allocationRule]}</td>
                  <td>{policy.updatedAt}</td>
                  <td><button className="icon-button" type="button" aria-label={`Open ${policy.name}`} onClick={(event) => { event.stopPropagation(); onOpen(policy); }}><DotsThree size={20} weight="bold" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {policies.length === 0 ? <div className="empty-state"><MagnifyingGlass size={24} /><strong>No commitments found</strong><p>Try a different search or status filter.</p></div> : null}
      </section>
      <p className="table-footnote">Showing {policies.length} of {allPolicies.length} commitment policies</p>
    </>
  );
}

function CommitmentDetail({
  policy,
  tab,
  onTab,
  onBack,
  onEdit,
  onToggle,
  onCopy,
}: {
  policy: CommitmentPolicy;
  tab: DetailTab;
  onTab: (tab: DetailTab) => void;
  onBack: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onCopy: () => void;
}) {
  const compiled = compilePolicy(policy);
  return (
    <>
      <button className="back-button" type="button" onClick={onBack}><ArrowLeft size={17} />Commitments</button>
      <header className="detail-header">
        <div className={`category-mark category-${policy.category.toLowerCase()}`}>{policy.sku.slice(0, 2)}</div>
        <div className="detail-title"><div><StatusBadge status={policy.status} /><span>{CATEGORY_LABELS[policy.category]} · {policy.sku}</span></div><h1>{policy.name}</h1><p>{policy.item}</p></div>
        <div className="page-actions">
          <button className="button button-secondary" type="button" onClick={onToggle}>{policy.status === "ACTIVE" ? <Pause size={16} /> : <Play size={16} />}{policy.status === "ACTIVE" ? "Pause" : "Resume"}</button>
          <button className="button button-secondary" type="button" onClick={onEdit}><PencilSimple size={16} />Edit</button>
          <button className="button button-primary" type="button" onClick={() => onTab("proof")}><Flask size={17} weight="bold" />Test checkout</button>
        </div>
      </header>

      <nav className="tabs" aria-label="Commitment detail">
        <button type="button" data-active={tab === "overview"} onClick={() => onTab("overview")}>Overview</button>
        <button type="button" data-active={tab === "proof"} onClick={() => onTab("proof")}>Test checkout</button>
        <button type="button" data-active={tab === "agent"} onClick={() => onTab("agent")}>Agent terms</button>
      </nav>

      {tab === "overview" ? (
        <div className="detail-grid">
          <section className="surface detail-main">
            <div className="surface-header"><div><h2>Offer performance</h2><p>Inventory and customer outcomes for this policy.</p></div></div>
            <div className="performance-grid">
              <Metric label="Commitments acquired" value={String(policy.claimed)} note={`${Math.max(0, policy.capacity - policy.claimed)} remaining`} />
              <Metric label="Exercised" value={String(policy.exercised)} note="Deposit credited" />
              <Metric label="Expired" value={String(Math.max(0, policy.claimed - policy.exercised))} note="Fee retained" />
            </div>
            <div className="policy-terms">
              <h3>Commitment terms</h3>
              <dl>
                <div><dt>Commitment fee</dt><dd>{formatXsgd(BigInt(policy.feeAtomic))}</dd></div>
                <div><dt>Allocation</dt><dd>{ALLOCATION_LABELS[policy.allocationRule]}</dd></div>
                <div><dt>Hold duration</dt><dd>{policy.durationMinutes} minutes</dd></div>
                <div><dt>Exercise window</dt><dd>{policy.exerciseWindowMinutes} minutes</dd></div>
                <div><dt>Credit on exercise</dt><dd>{policy.creditOnExercise ? "Full commitment fee" : "No credit"}</dd></div>
                <div><dt>Refund on expiry</dt><dd>No</dd></div>
              </dl>
              <div className="terms-copy"><Info size={18} /><p>{policy.terms}</p></div>
            </div>
          </section>
          <aside className="surface detail-aside">
            <div className="surface-header"><div><h2>Agent availability</h2><p>What autonomous buyers can discover.</p></div></div>
            <div className="availability-value"><strong>{compiled.inventory.available}</strong><span>of {compiled.inventory.capacity} available</span></div>
            <div className="capacity-bar"><span style={{ width: `${(compiled.inventory.available / compiled.inventory.capacity) * 100}%` }} /></div>
            <dl className="key-values">
              <div><dt>Discovery</dt><dd>Published</dd></div>
              <div><dt>Payment</dt><dd>x402 exact</dd></div>
              <div><dt>Settlement</dt><dd>XSGD on Avalanche</dd></div>
              <div><dt>Authorization</dt><dd>Permit2</dd></div>
            </dl>
            <button className="button button-secondary button-full" type="button" onClick={() => onTab("agent")}><Code size={16} />View machine terms</button>
          </aside>
        </div>
      ) : null}

      {tab === "proof" ? <CommerceStage policy={policy} /> : null}

      {tab === "agent" ? (
        <section className="surface agent-terms-panel">
          <div className="surface-header"><div><h2>Machine-readable commitment</h2><p>The merchant policy compiled into inventory, payment, and exercise terms.</p></div><button className="button button-secondary" type="button" onClick={onCopy}><Copy size={16} />Copy JSON</button></div>
          <div className="endpoint-row"><span>GET</span><code>/api/policies</code><a href="/api/policies" target="_blank" rel="noreferrer">Open endpoint <ArrowSquareOut size={14} /></a></div>
          <pre><code>{JSON.stringify(compiled, null, 2)}</code></pre>
        </section>
      ) : null}
    </>
  );
}

function PolicyEditor({
  draft,
  errors,
  preview,
  editing,
  onDraft,
  onCancel,
  onSubmit,
}: {
  draft: PolicyDraft;
  errors: string[];
  preview: CommitmentPolicy | null;
  editing: boolean;
  onDraft: (draft: PolicyDraft) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const compiled = preview ? compilePolicy(preview) : null;
  const feeLabel = (() => {
    try { return formatXsgd(parseSgdToAtomic(draft.feeSgd)); } catch { return "—"; }
  })();
  return (
    <form onSubmit={onSubmit}>
      <PageHeader
        title={editing ? "Edit commitment" : "Create commitment"}
        description="Define the customer promise once, then publish it for people and agents."
        actions={<button className="button button-primary" type="submit" disabled={errors.length > 0}><CheckCircle size={17} weight="bold" />{editing ? "Update commitment" : "Publish commitment"}</button>}
      />
      <div className="editor-layout">
        <div className="editor-form">
          <section className="form-section">
            <div className="form-section-title"><span>1</span><div><h2>Offer details</h2><p>Name the promise and connect it to merchant inventory.</p></div></div>
            <div className="field-grid">
              <label className="field"><span>Offer name</span><input value={draft.name} onChange={(event) => onDraft({ ...draft, name: event.target.value })} /></label>
              <label className="field"><span>Inventory item</span><input value={draft.item} onChange={(event) => onDraft({ ...draft, item: event.target.value })} /></label>
              <label className="field"><span>Category</span><select value={draft.category} onChange={(event) => onDraft({ ...draft, category: event.target.value as PolicyDraft["category"] })}>{Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="field"><span>Total capacity</span><input type="number" min="1" value={draft.capacity} onChange={(event) => onDraft({ ...draft, capacity: Number(event.target.value) })} /></label>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title"><span>2</span><div><h2>Commitment economics</h2><p>Set what the buyer pays and how that value is handled.</p></div></div>
            <div className="field-grid">
              <label className="field"><span>Commitment fee</span><div className="money-input"><span>S$</span><input inputMode="decimal" value={draft.feeSgd} onChange={(event) => onDraft({ ...draft, feeSgd: event.target.value })} /><b>XSGD</b></div><small>Uses six decimal atomic units on-chain.</small></label>
              <label className="field"><span>Allocation rule</span><select value={draft.allocationRule} onChange={(event) => onDraft({ ...draft, allocationRule: event.target.value as PolicyDraft["allocationRule"] })}>{Object.entries(ALLOCATION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><small>Inventory is decided before payment settlement.</small></label>
              <label className="field"><span>Commitment duration</span><div className="unit-input"><input type="number" min="1" value={draft.durationMinutes} onChange={(event) => onDraft({ ...draft, durationMinutes: Number(event.target.value) })} /><span>minutes</span></div></label>
              <label className="field"><span>Exercise window</span><div className="unit-input"><input type="number" min="1" value={draft.exerciseWindowMinutes} onChange={(event) => onDraft({ ...draft, exerciseWindowMinutes: Number(event.target.value) })} /><span>minutes</span></div></label>
            </div>
            <label className="check-field"><input type="checkbox" checked={draft.creditOnExercise} onChange={(event) => onDraft({ ...draft, creditOnExercise: event.target.checked })} /><span><CheckCircle size={19} weight="fill" /><strong>Credit the full commitment fee on exercise</strong><small>The deposit becomes order credit when the buyer completes the promise on time.</small></span></label>
          </section>

          <section className="form-section">
            <div className="form-section-title"><span>3</span><div><h2>Customer terms</h2><p>Keep the promise clear enough for a person to understand.</p></div></div>
            <label className="field"><span>Customer-facing terms</span><textarea rows={4} value={draft.terms} onChange={(event) => onDraft({ ...draft, terms: event.target.value })} /><small>{draft.terms.length} characters</small></label>
          </section>
        </div>

        <aside className="editor-preview">
          <section className="preview-card">
            <div className="preview-tabs"><span data-active>Customer offer</span><span>Agent terms</span></div>
            <div className="preview-body">
              <span className="preview-kicker">Limited availability</span>
              <h2>{draft.name || "Untitled commitment"}</h2>
              <p>{draft.item || "Select an inventory item"}</p>
              <dl>
                <div><dt><Wallet size={16} />Commitment fee</dt><dd>{feeLabel}</dd></div>
                <div><dt><Clock size={16} />Valid for</dt><dd>{draft.durationMinutes || 0} minutes</dd></div>
                <div><dt><Package size={16} />Capacity</dt><dd>{draft.capacity || 0}</dd></div>
                <div><dt><Receipt size={16} />On exercise</dt><dd>{draft.creditOnExercise ? "Fully credited" : "No credit"}</dd></div>
              </dl>
              <p className="preview-terms">{draft.terms || "Add customer-facing terms."}</p>
            </div>
          </section>
          <section className="readiness-card">
            <div><ShieldCheck size={20} weight="fill" /><span><strong>Offer readiness</strong><small>{errors.length ? `${errors.length} field ${errors.length === 1 ? "needs" : "need"} attention` : "Ready to publish"}</small></span></div>
            <ul>
              <li><i data-ready={Boolean(compiled)} /><span>Avalanche C-Chain</span><b>{compiled ? "Ready" : "Pending"}</b></li>
              <li><i data-ready={Boolean(compiled)} /><span>XSGD · 6 decimals</span><b>{compiled ? "Ready" : "Pending"}</b></li>
              <li><i data-ready={Boolean(compiled)} /><span>x402 exact + Permit2</span><b>{compiled ? "Ready" : "Pending"}</b></li>
              <li><i data-ready={Boolean(compiled)} /><span>Inventory protection</span><b>{compiled ? "Ready" : "Pending"}</b></li>
            </ul>
          </section>
          {errors.length ? <div className="validation-summary" role="alert"><Info size={18} /><div><strong>Complete the policy</strong><ul>{errors.slice(0, 3).map((error) => <li key={error}>{error}</li>)}</ul></div></div> : null}
        </aside>
      </div>
      <footer className="editor-footer"><span><CheckCircle size={18} weight={errors.length ? "regular" : "fill"} />{errors.length ? "Complete the required fields before publishing" : "All required fields complete"}</span><button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit" disabled={errors.length > 0}>{editing ? "Update commitment" : "Publish commitment"}</button></footer>
    </form>
  );
}

function CatalogSection({ policies, onCreate }: { policies: CommitmentPolicy[]; onCreate: () => void }) {
  return (
    <>
      <PageHeader title="Catalog" description="Inventory currently available for commitment policies." actions={<button className="button button-primary" type="button" onClick={onCreate}><Plus size={17} />Add commitment</button>} />
      <section className="surface catalog-grid">
        {policies.map((policy) => (
          <article key={policy.id}>
            <span className={`category-mark category-${policy.category.toLowerCase()}`}>{policy.sku.slice(0, 2)}</span>
            <div><small>{CATEGORY_LABELS[policy.category]} · {policy.sku}</small><h2>{policy.item}</h2><p>{policy.name}</p></div>
            <dl><div><dt>Available</dt><dd>{Math.max(0, policy.capacity - policy.claimed)} / {policy.capacity}</dd></div><div><dt>Policy</dt><dd><StatusBadge status={policy.status} /></dd></div></dl>
          </article>
        ))}
      </section>
    </>
  );
}

function ActivitySection() {
  return (
    <>
      <PageHeader title="Activity" description="A readable audit trail for merchant policy and payment outcomes." />
      <section className="surface activity-panel">
        <div className="surface-header"><div><h2>Recent activity</h2><p>Settlement receipts and policy changes.</p></div></div>
        <ol className="activity-list">
          {ACTIVITY.map((event) => <li key={`${event.title}-${event.time}`}><span data-kind={event.kind}><Pulse size={17} /></span><div><strong>{event.title}</strong><p>{event.detail}</p></div><time>{event.time}</time></li>)}
        </ol>
      </section>
    </>
  );
}

function SettingsSection() {
  return (
    <>
      <PageHeader title="Settings" description="Merchant identity, settlement account, and buyer safeguards." />
      <div className="settings-grid">
        <section className="surface settings-card"><div className="settings-heading"><Storefront size={21} /><div><h2>Merchant profile</h2><p>Identity shown to buyer agents.</p></div></div><dl className="key-values"><div><dt>Merchant</dt><dd>Atlas Bistro</dd></div><div><dt>Region</dt><dd>Singapore</dd></div><div><dt>Settlement asset</dt><dd>XSGD</dd></div></dl></section>
        <section className="surface settings-card"><div className="settings-heading"><Wallet size={21} /><div><h2>Settlement account</h2><p>Receives commitment payments in XSGD.</p></div></div><div className="configured-state"><CheckCircle size={20} weight="fill" /><div><strong>Settlement account connected</strong><p>The wallet address is hidden from the staff-facing view.</p></div></div></section>
        <section className="surface settings-card"><div className="settings-heading"><ShieldCheck size={21} /><div><h2>Buyer safeguards</h2><p>Rules applied to every commitment checkout.</p></div></div><dl className="key-values"><div><dt>Allocation</dt><dd>Decided before settlement</dd></div><div><dt>Unsuccessful buyers</dt><dd>Not charged</dd></div><div><dt>Exercise</dt><dd>Commitment value credited</dd></div></dl></section>
      </div>
    </>
  );
}
