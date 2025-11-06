import mjml from 'mjml';
import { logger } from '../utils/logger.js';

interface AssembleMJMLParams {
  brandProfile: any;
  heroSection: any;
  productGrid: any;
  images: any[];
  intent: any;
}

/**
 * Assemble MJML from components
 */
export async function assembleMJML(params: AssembleMJMLParams): Promise<string> {
  const { brandProfile, heroSection, productGrid, images, intent } = params;

  const colorPalette = brandProfile.color_palette || {};
  const typography = brandProfile.typography || {};
  const logoUrl = brandProfile.logo_urls?.header || '';

  const mjmlTemplate = `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="${typography.body?.font || 'Helvetica, Arial, sans-serif'}" />
      <mj-text color="${colorPalette.text || '#1F1F1F'}" line-height="1.6" font-size="14px" />
      <mj-button background-color="${colorPalette.primary || '#000000'}" color="#FFFFFF" />
    </mj-attributes>
    <mj-style>
      a { color: ${colorPalette.primary || '#000000'}; text-decoration: none; }
      .header-logo { max-width: 200px; }
      @media only screen and (max-width: 480px) {
        .product-name { font-size: 14px !important; }
      }
    </mj-style>
  </mj-head>
  
  <mj-body background-color="${colorPalette.background || '#F7F7F7'}">
    <!-- Header -->
    <mj-section background-color="${colorPalette.primary || '#FFFFFF'}" padding="20px">
      <mj-column>
        ${logoUrl ? `
        <mj-image 
          src="${logoUrl}" 
          alt="${brandProfile.brand_name || 'Logo'}"
          width="200px"
          align="center"
          css-class="header-logo"
        />
        ` : `
        <mj-text align="center" font-size="24px" font-weight="bold">
          ${brandProfile.brand_name || 'Your Brand'}
        </mj-text>
        `}
      </mj-column>
    </mj-section>

    <!-- Hero Section -->
    <mj-section background-color="#FFFFFF" padding="0">
      <mj-column>
        ${images[0] ? `
        <mj-image 
          src="${images[0].cdn_url}" 
          alt="${heroSection.headline}"
          width="600px"
          padding="0"
        />
        ` : ''}
        
        <mj-text 
          align="center" 
          font-size="32px" 
          font-weight="bold" 
          padding="30px 20px 10px"
          line-height="1.2"
        >
          ${heroSection.headline}
        </mj-text>
        
        <mj-text 
          align="center" 
          font-size="16px" 
          padding="10px 40px 20px"
          color="${colorPalette.secondary || '#666666'}"
        >
          ${heroSection.subheadline}
        </mj-text>
        
        <mj-button 
          href="${heroSection.ctaLink || '#'}"
          padding="20px"
          border-radius="4px"
          font-size="16px"
          font-weight="bold"
        >
          ${heroSection.ctaText}
        </mj-button>
      </mj-column>
    </mj-section>

    <!-- Spacer -->
    <mj-section background-color="${colorPalette.background || '#F7F7F7'}" padding="20px">
      <mj-column>
        <mj-divider border-width="0" />
      </mj-column>
    </mj-section>

    <!-- Product Grid -->
    <mj-section background-color="${colorPalette.background || '#F7F7F7'}" padding="20px">
      <mj-column>
        <mj-text align="center" font-size="24px" font-weight="bold" padding-bottom="20px">
          ${intent.campaignType === 'promotional' ? 'Featured Products' : 'Shop The Collection'}
        </mj-text>
      </mj-column>
    </mj-section>

    ${generateProductGridMJML(productGrid.products, images.slice(1), colorPalette)}

    <!-- Footer -->
    <mj-section background-color="${colorPalette.primary || '#000000'}" padding="40px 20px">
      <mj-column>
        <mj-text align="center" color="#FFFFFF" font-size="12px" line-height="1.8">
          <a href="#" style="color: #FFFFFF;">Unsubscribe</a> | 
          <a href="#" style="color: #FFFFFF;">View in Browser</a> | 
          <a href="#" style="color: #FFFFFF;">Contact Us</a>
        </mj-text>
        
        <mj-text align="center" color="#CCCCCC" font-size="11px" padding-top="20px">
          © ${new Date().getFullYear()} ${brandProfile.brand_name || 'Company'}. All rights reserved.<br/>
          You're receiving this email because you subscribed to our newsletter.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `.trim();

  return mjmlTemplate;
}

/**
 * Generate product grid MJML (2-column layout)
 */
function generateProductGridMJML(products: any[], images: any[], colorPalette: any): string {
  const productPairs = [];
  
  for (let i = 0; i < products.length; i += 2) {
    productPairs.push(products.slice(i, i + 2));
  }

  return productPairs.map((pair, pairIndex) => {
    return `
    <mj-section background-color="${colorPalette.background || '#F7F7F7'}" padding="10px">
      ${pair.map((product: any, index: number) => {
        const imageIndex = pairIndex * 2 + index;
        const image = images[imageIndex];
        
        return `
      <mj-column width="50%" background-color="#FFFFFF" border-radius="8px">
        ${image ? `
        <mj-image 
          src="${image.cdn_url}" 
          alt="${product.name}"
          padding="10px"
          border-radius="8px 8px 0 0"
        />
        ` : ''}
        
        <mj-text 
          align="center" 
          font-size="16px" 
          font-weight="bold" 
          padding="10px 10px 5px"
          css-class="product-name"
        >
          ${product.name}
        </mj-text>
        
        <mj-text 
          align="center" 
          font-size="13px" 
          padding="5px 15px"
          color="${colorPalette.secondary || '#666666'}"
        >
          ${product.description}
        </mj-text>
        
        ${product.price ? `
        <mj-text 
          align="center" 
          font-size="18px" 
          font-weight="bold" 
          padding="10px"
          color="${colorPalette.accent || '#CC0000'}"
        >
          ${product.price}
        </mj-text>
        ` : ''}
        
        <mj-button 
          href="#"
          background-color="${colorPalette.primary || '#000000'}"
          color="#FFFFFF"
          font-size="14px"
          padding="10px"
          border-radius="4px"
        >
          ${product.ctaText || 'Shop Now'}
        </mj-button>
      </mj-column>
        `;
      }).join('')}
    </mj-section>
    `;
  }).join('\n');
}

/**
 * Render MJML to HTML
 */
export async function renderMJMLToHTML(mjmlContent: string): Promise<string> {
  try {
    const result = mjml(mjmlContent, {
      validationLevel: 'soft',
      minify: false,
    });

    if (result.errors.length > 0) {
      logger.warn('MJML rendering warnings', { errors: result.errors });
    }

    return result.html;
  } catch (error) {
    logger.error('MJML rendering failed', { error });
    throw new Error('Failed to render email HTML');
  }
}

/**
 * Extract inline styles for better email client compatibility
 */
export function inlineStyles(html: string): string {
  // MJML already inlines styles, but this is a placeholder for additional processing
  return html;
}

/**
 * Validate email HTML
 */
export function validateEmailHTML(html: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for common issues
  if (html.length > 102000) {
    errors.push('Email HTML exceeds 102KB (Gmail clip limit)');
  }

  if (!html.includes('<!DOCTYPE')) {
    errors.push('Missing DOCTYPE declaration');
  }

  if (!html.includes('viewport')) {
    errors.push('Missing viewport meta tag');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

