
const EXPIRING_SOON_DAYS        = 5;
const LOW_UNIT_STOCK_THRESHOLD  = 5;
const LOW_WEIGHT_STOCK_THRESHOLD = 5;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function _daysBetween(start, end) {
  return Math.ceil((end.getTime() - start.getTime()) / 86_400_000);
}

function _fmtDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function _toCamel(type) {
  switch (type) {
    case 'low_stock':     return 'lowStock';
    case 'out_of_stock':  return 'outOfStock';
    case 'expiring_soon': return 'expiringSoon';
    default:              return type;
  }
}

function _alertTone(alertType) {
  switch (alertType) {
    case 'expired':
    case 'out_of_stock':  return 'danger';
    case 'expiring_soon': return 'warning';
    case 'low_stock':     return 'low';
  }
}

function _alertPriority(alertType) {
  switch (alertType) {
    case 'expired':       return 1;
    case 'out_of_stock':  return 2;
    case 'expiring_soon': return 3;
    case 'low_stock':     return 4;
    default:              return 5;
  }
}

function _make(alertType, product, productType, lotId, detailKey, extra = {}) {
  return {
    alertType,
    productId:   product.id,
    productType,
    productName: product.name,
    lotId,
    tone:        _alertTone(alertType),
    priority:    _alertPriority(alertType),
    detailKey,
    detailParams: {
      productName: product.name,
      lotId:       lotId === null ? '' : `#${lotId}`,
      ...extra,
    },
  };
}

// ─── StockAlert entity ───────────────────────────────────────────────────────

export class StockAlert {
  static AlertType = {
    LOW_STOCK:     'low_stock',
    OUT_OF_STOCK:  'out_of_stock',
    EXPIRING_SOON: 'expiring_soon',
    EXPIRED:       'expired',
  };

  static AlertSeverity = {
    WARNING:  'warning',
    CRITICAL: 'critical',
  };

  constructor(data) {
    this._id        = data._id;
    this._lotId     = data._lotId;
    this._productId = data._productId;
    this._alertType = data._alertType;
    this._severity  = data._severity;
    this._message   = data._message;
    this._createdAt = data._createdAt;
  }

  get id()        { return this._id; }
  set id(v)       { this._id = v; }

  get lotId()     { return this._lotId; }
  set lotId(v)    { this._lotId = v; }

  get productId() { return this._productId; }
  set productId(v){ this._productId = v; }

  get alertType() { return this._alertType; }
  set alertType(v){ this._alertType = v; }

  get severity()  { return this._severity; }
  set severity(v) { this._severity = v; }

  get message()   { return this._message; }
  set message(v)  { this._message = v; }

  get createdAt() { return this._createdAt; }
  set createdAt(v){ this._createdAt = v; }

  get isLowStock()     { return this._alertType === StockAlert.AlertType.LOW_STOCK; }
  get isOutOfStock()   { return this._alertType === StockAlert.AlertType.OUT_OF_STOCK; }
  get isExpiringSoon() { return this._alertType === StockAlert.AlertType.EXPIRING_SOON; }
  get isExpired()      { return this._alertType === StockAlert.AlertType.EXPIRED; }

  // ─── Static factory: compute raw alerts from lot data ────────────────────

  /**
   * Mirrors Angular's StockAlert.buildFromLots().
   * Returns a flat array of plain alert objects sorted by priority.
   *
   * @param {Array} unitProducts
   * @param {Array} weightProducts
   * @param {Array} unitLots
   * @param {Array} weightLots
   * @param {Date}  [now]
   */
  static buildFromLots(unitProducts, weightProducts, unitLots, weightLots, now = new Date()) {
    const today  = _startOfDay(now);
    const alerts = [];

    // ── Unit products ──────────────────────────────────────────
    for (const product of unitProducts) {
      const productLots = unitLots.filter(l => l.productId === product.id);
      const totalStock  = productLots.reduce((s, l) => s + Number(l.quantity  || 0), 0);
      const outLots     = productLots.filter(l => Number(l.quantity  || 0) <= 0);

      for (const lot of outLots) {
        alerts.push(_make('out_of_stock', product, 'unit', lot.id, 'lots.alerts.detail.outOfStock'));
      }
      if (outLots.length === 0 && totalStock <= 0) {
        alerts.push(_make('out_of_stock', product, 'unit', null, 'lots.alerts.detail.outOfStockNoLot'));
      }
      if (totalStock > 0 && totalStock <= LOW_UNIT_STOCK_THRESHOLD) {
        const lot = productLots[0];
        alerts.push(_make(
          'low_stock', product, 'unit',
          lot?.id ?? null,
          lot ? 'lots.alerts.detail.lowStock' : 'lots.alerts.detail.lowStockNoLot',
        ));
      }

      for (const lot of productLots) {
        if (!lot.expiryDate) continue;
        const expiryDate = _startOfDay(new Date(lot.expiryDate));
        if (isNaN(expiryDate.getTime())) continue;
        const days = _daysBetween(today, expiryDate);
        if (days < 0) {
          alerts.push(_make('expired', product, 'unit', lot.id, 'lots.alerts.detail.expired',
            { expiryDate: _fmtDate(expiryDate) }));
        } else if (days <= EXPIRING_SOON_DAYS) {
          alerts.push(_make('expiring_soon', product, 'unit', lot.id, 'lots.alerts.detail.expiringSoon',
            { days, expiryDate: _fmtDate(expiryDate) }));
        }
      }
    }

    // ── Weight products ────────────────────────────────────────
    for (const product of weightProducts) {
      const productLots = weightLots.filter(l => l.productId === product.id);
      const totalStock  = productLots.reduce((s, l) => s + Number(l.quantityKg || 0), 0);
      const outLots     = productLots.filter(l => Number(l.quantityKg || 0) <= 0);

      for (const lot of outLots) {
        alerts.push(_make('out_of_stock', product, 'weight', lot.id, 'lots.alerts.detail.outOfStock'));
      }
      if (outLots.length === 0 && totalStock <= 0) {
        alerts.push(_make('out_of_stock', product, 'weight', null, 'lots.alerts.detail.outOfStockNoLot'));
      }
      if (totalStock > 0 && totalStock <= LOW_WEIGHT_STOCK_THRESHOLD) {
        const lot = productLots[0];
        alerts.push(_make(
          'low_stock', product, 'weight',
          lot?.id ?? null,
          lot ? 'lots.alerts.detail.lowStock' : 'lots.alerts.detail.lowStockNoLot',
        ));
      }
    }

    return alerts.sort((a, b) => a.priority - b.priority);
  }

  static summarize(alerts) {
    const types    = ['expired', 'out_of_stock', 'expiring_soon', 'low_stock'];
    const summaries = [];

    for (const type of types) {
      const byType = alerts.filter(a => a.alertType === type);
      if (!byType.length) continue;

      const keys = [...new Set(byType.map(a => `${a.productType}:${a.productId}`))];

      for (const key of keys) {
        const [productType, productIdStr] = key.split(':');
        const productId = Number(productIdStr);
        const group     = byType.filter(a => a.productId === productId && a.productType === productType);
        const first     = group[0];

        summaries.push({
          alertType:    type,
          tone:         first.tone,
          priority:     first.priority,
          count:        group.length,
          titleKey:     `lots.alerts.title.${_toCamel(type)}`,
          titleParams:  { count: group.length },
          detailKey:    first.detailKey,
          detailParams: first.detailParams,
        });
      }
    }

    return summaries.sort((a, b) => a.priority - b.priority);
  }
}
