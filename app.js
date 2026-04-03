/* ============================================
   GLW RESEARCH DASHBOARD — JAVASCRIPT
   Enhanced with interactive features
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // === NAV SCROLL BEHAVIOR ===
  const nav = document.getElementById('navbar');
  const sections = document.querySelectorAll('.section, .hero');
  const navLinks = document.querySelectorAll('.nav-links a');

  // === SCROLL PROGRESS BAR ===
  const scrollProgress = document.getElementById('scrollProgress');

  // === BACK TO TOP ===
  const backToTop = document.getElementById('backToTop');
  const heroSection = document.getElementById('hero');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);

    // Active nav link
    let current = '';
    sections.forEach(s => {
      const top = s.offsetTop - 100;
      if (window.scrollY >= top) current = s.getAttribute('id');
    });
    navLinks.forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('href') === '#' + current) l.classList.add('active');
    });

    // Scroll progress bar
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    scrollProgress.style.width = scrollPct + '%';

    // Back to top visibility
    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    backToTop.classList.toggle('visible', window.scrollY > heroBottom);
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // === REVEAL ON SCROLL ===
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));

  // === ANIMATED NUMBER COUNTERS ===
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    if (!target && target !== 0) return;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    const decimals = target % 1 !== 0 ? 2 : 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const kpiValues = document.querySelectorAll('.kpi-value[data-target], .metric-value[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  kpiValues.forEach(el => counterObserver.observe(el));

  // === KPI SPARKLINES ===
  function createSparkline(svgId, data) {
    const svg = document.getElementById(svgId);
    if (!svg) return;
    const w = 80, h = 24, pad = 2;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
      const y = h - pad - ((v - min) / range) * (h - 2 * pad);
      return `${x},${y}`;
    });
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', points.join(' '));
    svg.appendChild(polyline);
    // Add end dot
    const lastPt = points[points.length - 1].split(',');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', lastPt[0]);
    circle.setAttribute('cy', lastPt[1]);
    circle.setAttribute('r', '2.5');
    svg.appendChild(circle);
  }
  // Stock price trend (approximate quarterly)
  createSparkline('sparkPrice', [32, 35, 38, 44, 48, 52, 47, 146.72]);
  // P/E trend
  createSparkline('sparkPE', [25, 28, 32, 45, 60, 72, 78.9]);

  // === TIMELINE STAGES ===
  const stages = document.querySelectorAll('.timeline-stage');
  const stageDetails = document.querySelectorAll('.stage-detail');
  stages.forEach(stage => {
    stage.addEventListener('click', () => {
      const num = stage.dataset.stage;
      stages.forEach(s => s.classList.remove('active'));
      stage.classList.add('active');
      stageDetails.forEach(d => d.classList.remove('visible'));
      document.getElementById('stage-detail-' + num).classList.add('visible');
    });
  });

  // === SOTP CHART + TOGGLE ===
  const sotpData = {
    segments: ['Optical\nComms', 'Display\nTech', 'Specialty\n(Gorilla)', 'Semi\nGlass', 'Environ.', 'Life Sci.', 'Hemlock\n/Emerging'],
    bear:  [46.2, 11.2, 5.5, 3.0, 3.5, 1.8, 0.9],
    base:  [73.5, 14.4, 7.2, 4.5, 4.5, 2.4, 1.5],
    bull:  [105.0, 17.6, 9.9, 7.5, 5.5, 3.0, 2.3],
    prices: { bear: '$74', base: '$116', bull: '$166' },
    totalEV: { bear: '$72.1B', base: '$108.0B', bull: '$150.8B' },
    upside: { bear: '-49.6%', base: '-21%', bull: '+13%' }
  };

  const chartColors = ['#1B3A5C', '#4A7FB5', '#D4A574', '#A84B2F', '#8B6F47', '#C17D54', '#2E5A88'];
  const semiGlassColor = '#A84B2F';

  const sotpCtx = document.getElementById('sotpChart').getContext('2d');
  const sotpChart = new Chart(sotpCtx, {
    type: 'bar',
    data: {
      labels: sotpData.segments,
      datasets: [{
        label: 'Enterprise Value ($B)',
        data: sotpData.base,
        backgroundColor: chartColors.map((c, i) => i === 3 ? semiGlassColor : c),
        borderColor: chartColors.map((c, i) => i === 3 ? '#7A3420' : c),
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0F2440',
          titleFont: { family: "'Source Sans 3', sans-serif", weight: '700' },
          bodyFont: { family: "'Inter', sans-serif" },
          padding: 12,
          callbacks: {
            label: ctx => '$' + ctx.parsed.y.toFixed(1) + 'B'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(27,58,92,0.06)' },
          ticks: {
            callback: v => '$' + v + 'B',
            font: { family: "'Inter', sans-serif", size: 11 },
            color: '#6B7280'
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 10 },
            color: '#6B7280',
            maxRotation: 0,
          }
        }
      },
      animation: { duration: 800, easing: 'easeOutQuart' }
    }
  });

  // SOTP controls — updated to support custom scenario
  const customPanel = document.getElementById('customScenarioPanel');
  let currentScenario = 'base';

  document.querySelectorAll('.sotp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sotp-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const scenario = btn.dataset.scenario;
      currentScenario = scenario;

      if (scenario === 'custom') {
        customPanel.classList.add('open');
        updateCustomSOTP();
      } else {
        customPanel.classList.remove('open');
        sotpChart.data.datasets[0].data = sotpData[scenario];
        sotpChart.update('active');
        document.getElementById('sotp-total-ev').textContent = sotpData.totalEV[scenario];
        document.getElementById('sotp-price').textContent = sotpData.prices[scenario];
        document.getElementById('sotp-upside').textContent = sotpData.upside[scenario];
      }
    });
  });

  // === SOTP CUSTOM SCENARIO SLIDERS ===
  const segmentNames = ['Optical Comms', 'Display Tech', 'Specialty (Gorilla)', 'Semi Glass', 'Environmental', 'Life Sciences', 'Hemlock/Emerging'];
  const ebitdaBase = [3.15, 0.72, 0.36, 0.15, 0.18, 0.12, 0.06];
  const baseMultiples = [23.3, 20.0, 20.0, 30.0, 25.0, 20.0, 25.0];
  const netDebt = 8.7;
  const sharesOutstanding = 858;
  const sliderGrid = document.getElementById('sliderGrid');
  const sliders = [];

  segmentNames.forEach((name, i) => {
    const div = document.createElement('div');
    div.className = 'slider-item';
    div.innerHTML = `
      <label>${name} <span class="slider-val" id="sliderVal${i}">${baseMultiples[i].toFixed(1)}x</span></label>
      <input type="range" min="5" max="50" step="0.5" value="${baseMultiples[i]}" id="slider${i}">
      <div class="slider-range-labels"><span>5x</span><span>50x</span></div>
    `;
    sliderGrid.appendChild(div);
    const input = div.querySelector('input');
    sliders.push(input);
    input.addEventListener('input', () => {
      document.getElementById('sliderVal' + i).textContent = parseFloat(input.value).toFixed(1) + 'x';
      updateCustomSOTP();
    });
  });

  function updateCustomSOTP() {
    const evs = sliders.map((s, i) => parseFloat(s.value) * ebitdaBase[i]);
    const totalEV = evs.reduce((a, b) => a + b, 0);
    const equityValue = totalEV - netDebt;
    const pricePerShare = (equityValue * 1000) / sharesOutstanding; // $B to $M then /shares
    const upside = ((pricePerShare / 146.72) - 1) * 100;

    // Update chart
    sotpChart.data.datasets[0].data = evs;
    sotpChart.update('active');

    // Update summary
    document.getElementById('sotp-total-ev').textContent = '$' + totalEV.toFixed(1) + 'B';
    document.getElementById('sotp-price').textContent = '$' + Math.round(pricePerShare);
    const sign = upside >= 0 ? '+' : '';
    document.getElementById('sotp-upside').textContent = sign + upside.toFixed(0) + '%';

    // Update custom panel price
    document.getElementById('customPrice').textContent = '$' + Math.round(pricePerShare);
  }

  document.getElementById('customResetBtn').addEventListener('click', () => {
    sliders.forEach((s, i) => {
      s.value = baseMultiples[i];
      document.getElementById('sliderVal' + i).textContent = baseMultiples[i].toFixed(1) + 'x';
    });
    updateCustomSOTP();
  });

  // === SEGMENT DOUGHNUT (with click drill-down + cross-chart highlighting) ===
  const segmentDrillData = [
    { name: 'Optical Comms', revenue: '$6.27B', growth: '+35% YoY', drivers: '40% from Meta deal, Enterprise +61%. AI data center buildout driving massive fiber demand.', margin: 'Highest margin segment' },
    { name: 'Display Tech', revenue: '$3.59B', growth: '+3% YoY', drivers: 'Gen 10.5 fabs, IT panels growing. Stable LCD glass business with pricing discipline.', margin: 'Mature, stable margin' },
    { name: 'Specialty Materials', revenue: '$2.21B', growth: '+5% YoY', drivers: 'Gorilla Glass Armor, Samsung partnership. Premium glass for smartphones/wearables.', margin: 'High margin, premium products' },
    { name: 'Environmental', revenue: '$1.73B', growth: '+3% YoY', drivers: 'GPF adoption in China driving growth. Gasoline particulate filters regulation tailwind.', margin: 'Moderate margin' },
    { name: 'Life Sciences', revenue: '$0.97B', growth: '+6% YoY', drivers: 'Bioprocessing growth. Lab glass, cell culture, pharmaceutical packaging.', margin: 'Growing margin' },
    { name: 'Hemlock/Emerging', revenue: '$0.86B', growth: 'Flat YoY', drivers: 'Polysilicon stabilizing. Solar-grade silicon and emerging technology portfolio.', margin: 'Variable margin' }
  ];

  const segCtx = document.getElementById('segmentDoughnut').getContext('2d');
  const segmentDoughnut = new Chart(segCtx, {
    type: 'doughnut',
    data: {
      labels: ['Optical Comms', 'Display Tech', 'Specialty Materials', 'Environmental', 'Life Sciences', 'Hemlock/Emerging'],
      datasets: [{
        data: [6.27, 3.59, 2.21, 1.73, 0.97, 0.86],
        backgroundColor: ['#1B3A5C', '#4A7FB5', '#A84B2F', '#D4A574', '#8B6F47', '#C17D54'],
        borderWidth: 2,
        borderColor: '#FFFFFF',
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      onClick: (e, elements) => {
        if (elements.length > 0) {
          showSegmentDrilldown(elements[0].index);
        }
      },
      onHover: (e, elements) => {
        // Cross-chart highlighting
        if (elements.length > 0) {
          highlightSOTPBar(elements[0].index);
        } else {
          clearSOTPHighlight();
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 14,
            usePointStyle: true,
            pointStyleWidth: 10,
            font: { family: "'Inter', sans-serif", size: 11 },
            color: '#6B7280'
          }
        },
        tooltip: {
          backgroundColor: '#0F2440',
          padding: 12,
          titleFont: { family: "'Source Sans 3', sans-serif", weight: '700' },
          bodyFont: { family: "'Inter', sans-serif" },
          callbacks: {
            label: ctx => {
              const val = ctx.parsed;
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((val / total) * 100).toFixed(0);
              return ctx.label + ': $' + val.toFixed(2) + 'B (' + pct + '%)';
            }
          }
        }
      },
      animation: { animateRotate: true, duration: 1000 }
    }
  });

  // === SEGMENT DRILLDOWN PANEL ===
  const drilldown = document.getElementById('segmentDrilldown');
  const drilldownContent = document.getElementById('drilldownContent');
  const drilldownClose = document.getElementById('drilldownClose');

  function showSegmentDrilldown(index) {
    const d = segmentDrillData[index];
    drilldownContent.innerHTML = `
      <div class="dd-name">${d.name}</div>
      <div><span class="dd-label">Revenue</span><div class="dd-stat">${d.revenue}</div></div>
      <div><span class="dd-label">Growth</span><div class="dd-stat">${d.growth}</div></div>
      <div class="dd-drivers"><strong>Key Drivers:</strong> ${d.drivers}<br><em>${d.margin}</em></div>
    `;
    drilldown.classList.add('open');
  }

  drilldownClose.addEventListener('click', () => {
    drilldown.classList.remove('open');
  });

  // === CROSS-CHART HIGHLIGHTING ===
  // Doughnut segments map to SOTP bars (mostly 1:1 but segment names differ slightly)
  // Doughnut: Optical Comms(0), Display(1), Specialty(2), Environmental(3), Life Sci(4), Hemlock(5)
  // SOTP:     Optical(0), Display(1), Specialty(2), Semi Glass(3), Environ(4), Life Sci(5), Hemlock(6)
  // Map: doughnut idx → sotp idx
  const doughnutToSOTP = [0, 1, 2, 4, 5, 6]; // skip semi glass (3)

  function highlightSOTPBar(doughnutIdx) {
    const sotpIdx = doughnutToSOTP[doughnutIdx];
    if (sotpIdx === undefined) return;
    const meta = sotpChart.getDatasetMeta(0);
    meta.data.forEach((bar, i) => {
      bar.options.backgroundColor = i === sotpIdx ? chartColors[sotpIdx] : 'rgba(27,58,92,0.12)';
    });
    sotpChart.update('none');
  }

  function clearSOTPHighlight() {
    const meta = sotpChart.getDatasetMeta(0);
    meta.data.forEach((bar, i) => {
      bar.options.backgroundColor = i === 3 ? semiGlassColor : chartColors[i];
    });
    sotpChart.update('none');
  }

  // SOTP hover → highlight doughnut
  const sotpCanvas = document.getElementById('sotpChart');
  sotpCanvas.addEventListener('mousemove', (e) => {
    const elements = sotpChart.getElementsAtEventForMode(e, 'index', { intersect: true }, false);
    if (elements.length > 0) {
      const sotpIdx = elements[0].index;
      // Find corresponding doughnut index
      const dIdx = doughnutToSOTP.indexOf(sotpIdx);
      if (dIdx !== -1) {
        const dmeta = segmentDoughnut.getDatasetMeta(0);
        dmeta.data.forEach((arc, i) => {
          arc.options.offset = i === dIdx ? 12 : 0;
        });
        segmentDoughnut.update('none');
      }
    }
  });
  sotpCanvas.addEventListener('mouseleave', () => {
    const dmeta = segmentDoughnut.getDatasetMeta(0);
    dmeta.data.forEach((arc) => {
      arc.options.offset = 0;
    });
    segmentDoughnut.update('none');
  });

  // === REVENUE TREND LINE ===
  const trendCtx = document.getElementById('revenueTrend').getContext('2d');
  new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: ['2021', '2022', '2023', '2024', '2025'],
      datasets: [
        {
          label: 'Total Revenue',
          data: [14.08, 14.19, 12.59, 13.12, 15.63],
          borderColor: '#1B3A5C',
          backgroundColor: 'rgba(27,58,92,0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#1B3A5C',
          borderWidth: 2.5,
        },
        {
          label: 'Optical Comms',
          data: [4.35, 5.01, 4.41, 4.65, 6.27],
          borderColor: '#A84B2F',
          backgroundColor: 'rgba(168,75,47,0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#A84B2F',
          borderWidth: 2.5,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            pointStyleWidth: 10,
            font: { family: "'Inter', sans-serif", size: 11 },
            color: '#6B7280'
          }
        },
        tooltip: {
          backgroundColor: '#0F2440',
          padding: 12,
          titleFont: { family: "'Source Sans 3', sans-serif", weight: '700' },
          bodyFont: { family: "'Inter', sans-serif" },
          callbacks: { label: ctx => ctx.dataset.label + ': $' + ctx.parsed.y.toFixed(2) + 'B' }
        }
      },
      scales: {
        y: {
          grid: { color: 'rgba(27,58,92,0.06)' },
          ticks: {
            callback: v => '$' + v + 'B',
            font: { size: 11 },
            color: '#6B7280'
          }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: '#6B7280' }
        }
      },
      animation: { duration: 1000 }
    }
  });

  // === REVENUE GROWTH CHART ===
  const revGrowthCtx = document.getElementById('revenueGrowthChart').getContext('2d');
  new Chart(revGrowthCtx, {
    type: 'bar',
    data: {
      labels: ['2021', '2022', '2023', '2024', '2025', '2026E', '2027E', '2028E'],
      datasets: [{
        label: 'Revenue ($B)',
        data: [14.08, 14.19, 12.59, 13.12, 15.63, 18.8, 21.4, 23.9],
        backgroundColor: [
          '#1B3A5C', '#1B3A5C', '#1B3A5C', '#1B3A5C', '#1B3A5C',
          'rgba(27,58,92,0.4)', 'rgba(27,58,92,0.3)', 'rgba(27,58,92,0.2)'
        ],
        borderColor: [
          '#1B3A5C', '#1B3A5C', '#1B3A5C', '#1B3A5C', '#1B3A5C',
          '#1B3A5C', '#1B3A5C', '#1B3A5C'
        ],
        borderWidth: [0, 0, 0, 0, 0, 2, 2, 2],
        borderDash: [0, 0, 0, 0, 0, [5,3], [5,3], [5,3]],
        borderRadius: 4,
        barPercentage: 0.65,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0F2440',
          padding: 12,
          titleFont: { family: "'Source Sans 3', sans-serif", weight: '700' },
          bodyFont: { family: "'Inter', sans-serif" },
          callbacks: {
            label: ctx => {
              const suffix = ctx.dataIndex >= 5 ? ' (Estimate)' : '';
              return '$' + ctx.parsed.y.toFixed(1) + 'B' + suffix;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(27,58,92,0.06)' },
          ticks: { callback: v => '$' + v + 'B', font: { size: 11 }, color: '#6B7280' }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: '#6B7280' }
        }
      },
      animation: { duration: 800 }
    }
  });

  // === EPS GROWTH CHART ===
  const epsGrowthCtx = document.getElementById('epsGrowthChart').getContext('2d');
  new Chart(epsGrowthCtx, {
    type: 'bar',
    data: {
      labels: ['2021', '2022', '2023', '2024', '2025', '2026E', '2027E', '2028E'],
      datasets: [{
        label: 'EPS ($)',
        data: [1.30, 1.56, 0.69, 0.59, 1.86, 5.09, 6.44, 7.50],
        backgroundColor: [
          '#A84B2F', '#A84B2F', '#A84B2F', '#A84B2F', '#A84B2F',
          'rgba(168,75,47,0.4)', 'rgba(168,75,47,0.3)', 'rgba(168,75,47,0.2)'
        ],
        borderColor: '#A84B2F',
        borderWidth: [0, 0, 0, 0, 0, 2, 2, 2],
        borderRadius: 4,
        barPercentage: 0.65,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0F2440',
          padding: 12,
          titleFont: { family: "'Source Sans 3', sans-serif", weight: '700' },
          bodyFont: { family: "'Inter', sans-serif" },
          callbacks: {
            label: ctx => {
              const suffix = ctx.dataIndex >= 5 ? ' (Estimate)' : '';
              return '$' + ctx.parsed.y.toFixed(2) + suffix;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(27,58,92,0.06)' },
          ticks: { callback: v => '$' + v.toFixed(2), font: { size: 11 }, color: '#6B7280' }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: '#6B7280' }
        }
      },
      animation: { duration: 800 }
    }
  });

  // === P/E COMPRESSION CHART ===
  const peCtx = document.getElementById('peCompressionChart').getContext('2d');
  new Chart(peCtx, {
    type: 'line',
    data: {
      labels: ['FY2025A (TTM)', 'FY2026E', 'FY2027E', 'FY2028E'],
      datasets: [
        {
          label: 'P/E Multiple',
          data: [78.9, 28.8, 22.8, 19.6],
          borderColor: '#1B3A5C',
          backgroundColor: 'rgba(27,58,92,0.05)',
          fill: true,
          tension: 0.35,
          pointRadius: 8,
          pointBackgroundColor: '#1B3A5C',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 3,
          pointHoverRadius: 10,
          borderWidth: 3,
        },
        {
          label: 'EPS ($)',
          data: [1.86, 5.09, 6.44, 7.50],
          borderColor: '#A84B2F',
          backgroundColor: 'rgba(168,75,47,0.05)',
          fill: true,
          tension: 0.35,
          pointRadius: 8,
          pointBackgroundColor: '#A84B2F',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 3,
          pointHoverRadius: 10,
          borderWidth: 3,
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            font: { family: "'Inter', sans-serif", size: 12 },
            color: '#6B7280'
          }
        },
        tooltip: {
          backgroundColor: '#0F2440',
          padding: 14,
          titleFont: { size: 13, weight: '700', family: "'Source Sans 3', sans-serif" },
          bodyFont: { size: 12, family: "'Inter', sans-serif" },
        }
      },
      scales: {
        y: {
          position: 'left',
          grid: { color: 'rgba(27,58,92,0.06)' },
          ticks: {
            callback: v => v + 'x',
            font: { size: 11 },
            color: '#1B3A5C'
          },
          title: {
            display: true,
            text: 'P/E Multiple',
            font: { size: 11, weight: '600' },
            color: '#1B3A5C'
          }
        },
        y1: {
          position: 'right',
          grid: { display: false },
          ticks: {
            callback: v => '$' + v.toFixed(2),
            font: { size: 11 },
            color: '#A84B2F'
          },
          title: {
            display: true,
            text: 'EPS ($)',
            font: { size: 11, weight: '600' },
            color: '#A84B2F'
          }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 12, weight: '600' }, color: '#6B7280' }
        }
      },
      animation: { duration: 1200 }
    }
  });

  // === SENSITIVITY ANALYSIS ===
  const sensRevGrowth = document.getElementById('sensRevGrowth');
  const sensOpMargin = document.getElementById('sensOpMargin');
  const sensPE = document.getElementById('sensPE');
  const sensRevGrowthVal = document.getElementById('sensRevGrowthVal');
  const sensOpMarginVal = document.getElementById('sensOpMarginVal');
  const sensPEVal = document.getElementById('sensPEVal');
  const sensPriceValue = document.getElementById('sensPriceValue');
  const sensPriceDelta = document.getElementById('sensPriceDelta');

  const baseRevenue = 15.6; // FY2025
  const currentPrice = 146.72;

  // Sensitivity mini chart
  const sensChartCtx = document.getElementById('sensRevenueChart').getContext('2d');
  const sensChart = new Chart(sensChartCtx, {
    type: 'bar',
    data: {
      labels: ['FY2025', 'FY2026E', 'FY2027E', 'FY2028E'],
      datasets: [{
        label: 'Revenue ($B)',
        data: [15.6, 18.72, 22.46, 26.96],
        backgroundColor: ['#1B3A5C', 'rgba(27,58,92,0.5)', 'rgba(27,58,92,0.35)', 'rgba(27,58,92,0.2)'],
        borderColor: '#1B3A5C',
        borderWidth: [0, 1.5, 1.5, 1.5],
        borderRadius: 4,
        barPercentage: 0.6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0F2440',
          padding: 10,
          titleFont: { family: "'Source Sans 3', sans-serif", weight: '700' },
          bodyFont: { family: "'Inter', sans-serif" },
          callbacks: { label: ctx => '$' + ctx.parsed.y.toFixed(1) + 'B' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(27,58,92,0.06)' },
          ticks: { callback: v => '$' + v + 'B', font: { size: 10 }, color: '#6B7280' }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: '#6B7280' }
        }
      },
      animation: { duration: 400 }
    }
  });

  function updateSensitivity() {
    const growthRate = parseFloat(sensRevGrowth.value) / 100;
    const opMargin = parseFloat(sensOpMargin.value) / 100;
    const peMultiple = parseFloat(sensPE.value);

    sensRevGrowthVal.textContent = (growthRate * 100).toFixed(0) + '%';
    sensOpMarginVal.textContent = (opMargin * 100).toFixed(1) + '%';
    sensPEVal.textContent = peMultiple.toFixed(1) + 'x';

    // Project forward revenues
    const rev26 = baseRevenue * (1 + growthRate);
    const rev27 = rev26 * (1 + growthRate);
    const rev28 = rev27 * (1 + growthRate);

    // EPS estimate: Revenue × operating margin × tax/interest adjustment / shares
    // Corning FY2026E: Rev $18.8B, OpMar ~18%, EPS $5.09 → calibration factor
    // $18.8B × 0.18 = $3.38B op income → $5.09 × 858M = $4.37B net income → ratio ≈ 1.29
    // Use calibrated net income factor that matches analyst estimates at base case
    const calibrationFactor = (5.09 * sharesOutstanding) / (18.8 * 0.18 * 1000); // ≈ 1.5
    const eps26 = (rev26 * opMargin * calibrationFactor * 1000) / sharesOutstanding;

    // Projected price
    const projectedPrice = eps26 * peMultiple;
    const delta = ((projectedPrice / currentPrice) - 1) * 100;

    sensPriceValue.textContent = '$' + projectedPrice.toFixed(0);
    const sign = delta >= 0 ? '+' : '';
    sensPriceDelta.textContent = sign + delta.toFixed(0) + '% vs. current';

    // Update mini chart
    sensChart.data.datasets[0].data = [baseRevenue, rev26, rev27, rev28];
    sensChart.update('active');
  }

  [sensRevGrowth, sensOpMargin, sensPE].forEach(slider => {
    slider.addEventListener('input', updateSensitivity);
  });
  updateSensitivity();

  // === RADAR CHART (MOAT) ===
  const radarCtx = document.getElementById('radarChart').getContext('2d');
  new Chart(radarCtx, {
    type: 'radar',
    data: {
      labels: ['Process IP', 'Material\nFormulations', 'Customer\nLock-in', 'Scale &\nManufacturing', 'Patent\nPosition'],
      datasets: [
        {
          label: 'Corning',
          data: [95, 90, 65, 92, 55],
          borderColor: '#1B3A5C',
          backgroundColor: 'rgba(27,58,92,0.15)',
          borderWidth: 2.5,
          pointRadius: 5,
          pointBackgroundColor: '#1B3A5C',
        },
        {
          label: 'AGC',
          data: [60, 80, 40, 55, 40],
          borderColor: '#A84B2F',
          backgroundColor: 'rgba(168,75,47,0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#A84B2F',
        },
        {
          label: 'SCHOTT',
          data: [55, 60, 35, 40, 35],
          borderColor: '#D4A574',
          backgroundColor: 'rgba(212,165,116,0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#D4A574',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            font: { family: "'Inter', sans-serif", size: 12 },
            color: '#6B7280',
            padding: 16,
          }
        },
        tooltip: {
          backgroundColor: '#0F2440',
          padding: 12,
          titleFont: { family: "'Source Sans 3', sans-serif", weight: '700' },
          bodyFont: { family: "'Inter', sans-serif" },
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 25,
            display: false,
          },
          grid: { color: 'rgba(27,58,92,0.08)' },
          angleLines: { color: 'rgba(27,58,92,0.08)' },
          pointLabels: {
            font: { family: "'Inter', sans-serif", size: 11, weight: '500' },
            color: '#6B7280'
          }
        }
      },
      animation: { duration: 1000 }
    }
  });

  // === CATALYST EVENTS ===
  const catEvents = document.querySelectorAll('.cat-event');
  const catDetailBox = document.getElementById('catDetailBox');
  const catDetailText = document.getElementById('catDetailText');
  const catClose = document.getElementById('catClose');

  catEvents.forEach(ev => {
    ev.addEventListener('click', () => {
      catDetailText.textContent = ev.dataset.info;
      catDetailBox.classList.add('active');
    });
  });

  catClose.addEventListener('click', () => {
    catDetailBox.classList.remove('active');
  });

  // === CATALYST FILTERS ===
  document.querySelectorAll('.cat-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      catEvents.forEach(ev => {
        const confEl = ev.querySelector('.cat-conf');
        const confText = confEl ? confEl.textContent.trim().toUpperCase() : '';
        const isDone = ev.classList.contains('cat-done');

        let show = false;
        if (filter === 'all') {
          show = true;
        } else if (filter === 'completed') {
          show = isDone;
        } else if (filter === 'high') {
          show = confText.includes('HIGH') && !confText.includes('MED');
        } else if (filter === 'medium') {
          show = confText.includes('MED');
        } else if (filter === 'low') {
          show = confText.includes('LOW');
        }

        ev.classList.toggle('cat-hidden', !show);
      });
    });
  });

  // === RISK MATRIX EXPAND ===
  document.querySelectorAll('.risk-item').forEach(item => {
    if (!item.querySelector('.risk-mitigation')) {
      const mitDiv = document.createElement('div');
      mitDiv.className = 'risk-mitigation';
      mitDiv.innerHTML = '<strong>Mitigation:</strong> ' + item.dataset.mitigation;
      item.appendChild(mitDiv);
    }
    item.addEventListener('click', () => {
      const isExpanded = item.classList.contains('expanded');
      document.querySelectorAll('.risk-item').forEach(r => r.classList.remove('expanded'));
      if (!isExpanded) item.classList.add('expanded');
    });
  });

  // === SUPPLY CHAIN TOOLTIPS ===
  const tooltip = document.getElementById('tooltip');
  document.querySelectorAll('.sc-company[data-tooltip]').forEach(comp => {
    comp.addEventListener('mouseenter', (e) => {
      tooltip.textContent = comp.dataset.tooltip;
      tooltip.classList.add('active');
      // Highlight connected nodes
      highlightSupplyChainNodes(comp);
    });
    comp.addEventListener('mousemove', (e) => {
      tooltip.style.left = e.clientX + 12 + 'px';
      tooltip.style.top = e.clientY - 12 + 'px';
    });
    comp.addEventListener('mouseleave', () => {
      tooltip.classList.remove('active');
      clearSupplyChainHighlights();
    });
  });

  // === SUPPLY CHAIN ANIMATED PARTICLES ===
  document.querySelectorAll('.sc-arrows').forEach(arrowSection => {
    for (let i = 0; i < 4; i++) {
      const dot = document.createElement('div');
      dot.className = 'sc-particle';
      arrowSection.appendChild(dot);
    }
  });

  // === SUPPLY CHAIN HIGHLIGHT CONNECTED NODES ===
  function highlightSupplyChainNodes(comp) {
    const layer = comp.closest('.sc-layer');
    if (!layer) return;
    const layerNum = parseInt(layer.dataset.layer);

    // Highlight all nodes in the same layer and adjacent layers
    document.querySelectorAll('.sc-layer').forEach(l => {
      const lNum = parseInt(l.dataset.layer);
      if (Math.abs(lNum - layerNum) <= 1) {
        l.querySelectorAll('.sc-company').forEach(c => {
          c.classList.add('sc-highlight');
        });
      }
    });
  }

  function clearSupplyChainHighlights() {
    document.querySelectorAll('.sc-company.sc-highlight').forEach(c => {
      c.classList.remove('sc-highlight');
    });
  }

  // === COMPARISON TABLE FLIP PERSPECTIVE ===
  const compGrid = document.getElementById('comparisonGrid');
  const flipBtn = document.getElementById('flipPerspective');
  let isFlipped = false;

  // Store original data
  const compRows = [];
  const compHeaders = compGrid.querySelectorAll('.comp-header');
  const compCells = compGrid.querySelectorAll('.comp-cell');

  // Group cells into rows of 3
  for (let i = 0; i < compCells.length; i += 3) {
    compRows.push([compCells[i], compCells[i + 1], compCells[i + 2]]);
  }

  flipBtn.addEventListener('click', () => {
    isFlipped = !isFlipped;
    compGrid.classList.add('flipping');

    setTimeout(() => {
      if (isFlipped) {
        compHeaders[0].textContent = 'SKC / Absolics';
        compHeaders[0].className = 'comp-header comp-header--skc';
        compHeaders[2].textContent = 'Corning (GLW)';
        compHeaders[2].className = 'comp-header comp-header--corning';
      } else {
        compHeaders[0].textContent = 'Corning (GLW)';
        compHeaders[0].className = 'comp-header comp-header--corning';
        compHeaders[2].textContent = 'SKC / Absolics';
        compHeaders[2].className = 'comp-header comp-header--skc';
      }

      compRows.forEach(row => {
        // Swap first and third cell content and classes
        const tempText = row[0].textContent;
        const tempClass = row[0].className;
        row[0].textContent = row[2].textContent;
        row[0].className = row[2].className;
        row[2].textContent = tempText;
        row[2].className = tempClass;
      });

      setTimeout(() => compGrid.classList.remove('flipping'), 50);
    }, 200);

    flipBtn.querySelector('svg').style.transform = isFlipped ? 'rotate(180deg)' : 'rotate(0)';
    flipBtn.querySelector('svg').style.transition = 'transform 300ms ease';
  });

  // === COMPARISON ROW HOVER ===
  compCells.forEach((cell, i) => {
    const rowIdx = Math.floor(i / 3);
    cell.addEventListener('mouseenter', () => {
      const start = rowIdx * 3;
      for (let j = start; j < start + 3 && j < compCells.length; j++) {
        compCells[j].classList.add('comp-cell-hover');
      }
    });
    cell.addEventListener('mouseleave', () => {
      compCells.forEach(c => c.classList.remove('comp-cell-hover'));
    });
  });

  // === OPTION BAR ANIMATION ===
  const optionBars = document.querySelectorAll('.option-bar--potential .option-bar-fill');
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = '65%';
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  optionBars.forEach(bar => {
    bar.style.width = '0%';
    barObserver.observe(bar);
  });

  // === GAUGE ANIMATION ON SCROLL ===
  const gauges = document.querySelectorAll('.gauge-fill');
  const gaugeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Re-trigger animation by resetting width
        const targetWidth = entry.target.style.width;
        entry.target.style.width = '0%';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            entry.target.style.width = targetWidth;
          });
        });
        gaugeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  gauges.forEach(g => gaugeObserver.observe(g));

});

/* ============================================
   UPGRADE 1: Animated Number Counter — Enhanced
   (Existing counterObserver handles KPI cards.
    The animateCounter below is an enhanced version
    used internally; the existing one already fires
    via counterObserver. We add tabular-nums via CSS.)
   No additional JS needed — existing implementation
   already uses RAF + IntersectionObserver. ✓)
   ============================================ */

/* ============================================
   UPGRADE 2: Interactive P/E Sensitivity Matrix
   ============================================ */
(function initSensMatrix() {
  const matrix = document.querySelector('.sens-matrix');
  if (!matrix) return;

  const tooltip = document.getElementById('sensTooltip');
  const allCells = matrix.querySelectorAll('td');
  const allThs   = matrix.querySelectorAll('th');
  const numRows  = 5;
  const numCols  = 4; // including label col (col 0)

  // EPS labels for column headers
  const epsMap = { '1': '5.80', '2': '6.44', '3': '7.10' };

  allCells.forEach(td => {
    td.addEventListener('mouseenter', (e) => {
      const row = parseInt(td.dataset.row, 10);
      const col = parseInt(td.dataset.col, 10);

      // Highlight all cells in same row
      allCells.forEach(cell => {
        const r = parseInt(cell.dataset.row, 10);
        const c = parseInt(cell.dataset.col, 10);
        cell.classList.remove('row-highlight', 'cell-highlight');
        if (r === row) cell.classList.add('row-highlight');
      });

      // Highlight column headers
      allThs.forEach(th => {
        const tc = parseInt(th.dataset.col, 10);
        th.classList.toggle('col-highlight', tc === col && col > 0);
      });

      // Hovered cell: strongest highlight (skip label col 0)
      if (col > 0) {
        td.classList.remove('row-highlight');
        td.classList.add('cell-highlight');

        // Tooltip
        const pe  = td.dataset.pe;
        const eps = td.dataset.eps;
        const price = td.dataset.price;
        if (pe && eps && price && tooltip) {
          tooltip.textContent = `P/E: ${pe}× | EPS: $${eps} | Target: $${price}`;
          tooltip.classList.add('visible');
        }
      }
    });

    td.addEventListener('mousemove', (e) => {
      if (tooltip) {
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top  = (e.clientY - 28) + 'px';
      }
    });

    td.addEventListener('mouseleave', () => {
      allCells.forEach(cell => {
        cell.classList.remove('row-highlight', 'cell-highlight');
      });
      allThs.forEach(th => th.classList.remove('col-highlight'));
      if (tooltip) tooltip.classList.remove('visible');
    });
  });
})();

/* ============================================
   UPGRADE 3: Global Scenario Toggle State
   ============================================ */
(function initScenarioToggle() {
  let activeScenario = 'base';

  const scenarioBadge   = document.getElementById('scenarioBadge');
  const sotpPriceEl     = document.getElementById('sotp-price');
  const sotpUpsideEl    = document.getElementById('sotp-upside');
  const targetCards     = document.querySelectorAll('.target-card');

  const scenarioData = {
    bear: {
      badgeText: 'Bear Case Active',
      badgeClass: 'bear',
      sotpPrice: '$74',
      upside: '-12.7%',
      targetIndex: 0   // first target card
    },
    base: {
      badgeText: 'Base Case Active',
      badgeClass: '',
      sotpPrice: '$116',
      upside: '-21%',
      targetIndex: 1
    },
    bull: {
      badgeText: 'Bull Case Active',
      badgeClass: 'bull',
      sotpPrice: '$166',
      upside: '+13.2%',
      targetIndex: 2
    }
  };

  function applyScenario(scenario) {
    const d = scenarioData[scenario];
    if (!d) return;
    activeScenario = scenario;

    // Update scenario badge
    if (scenarioBadge) {
      scenarioBadge.textContent = d.badgeText;
      scenarioBadge.className = 'scenario-badge' + (d.badgeClass ? ' ' + d.badgeClass : '');
    }

    // Highlight target cards
    targetCards.forEach((card, i) => {
      card.classList.toggle('scenario-active', i === d.targetIndex);
    });
  }

  // Hook into existing SOTP buttons (they already update the chart/price)
  // We layer on the global state update
  document.querySelectorAll('.sotp-btn[data-scenario]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sc = btn.dataset.scenario;
      if (sc && sc !== 'custom') applyScenario(sc);
    });
  });

  // Initialize
  applyScenario('base');
})();

/* ============================================
   UPGRADE 4: Peer Comp Table Row Highlight
   (CSS handles :hover background; inline-bar
    widths are set via inline style in HTML.
    Below: animate inline-bar widths on viewport entry)
   ============================================ */
(function initCompTable() {
  const compTable = document.querySelector('.comp-table');
  if (!compTable) return;

  // Reset bars to 0 width, then animate on entry
  const bars = compTable.querySelectorAll('.inline-bar');
  bars.forEach(bar => {
    const targetWidth = bar.style.width;
    bar.dataset.targetWidth = targetWidth;
    bar.style.width = '0px';
  });

  const tableObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        bars.forEach((bar, i) => {
          setTimeout(() => {
            bar.style.width = bar.dataset.targetWidth;
          }, i * 80);
        });
        tableObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  tableObserver.observe(compTable);
})();

/* ============================================
   UPGRADE 5: Section Header Clip-Path Reveal
   (Card stagger via CSS + existing .reveal system.
    Below: trigger section header animations.)
   ============================================ */
(function initSectionHeaderReveal() {
  const headers = document.querySelectorAll('.section-header');

  // Add clip-ready only after DOM is loaded so headers are never
  // invisible without JS (progressive enhancement)
  const headerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-header');
        headerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

  headers.forEach(h => {
    h.classList.add('clip-ready');
    headerObserver.observe(h);
  });
})();

/* ============================================
   UPGRADE 6: Live Ticker Pulse
   (CSS handles the animation. The HTML already
    has .live-dot and .nav-price-delta injected.)
   ============================================ */

// === SENSITIVITY GATE BUTTON ===
(function() {
  const btn = document.getElementById('sgEnter');
  if (!btn) return;
  btn.addEventListener('click', function() {
    const target = document.getElementById('sensitivity');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
