/**
 * Footer Template Designs
 * 3 distinct visual layouts for email footers
 */

export interface FooterTemplate {
  id: string;
  name: string;
  description: string;
  links: Array<{ text: string; url: string }>;
}

export const footerTemplates: Record<string, FooterTemplate> = {
  minimal: {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Simple text links with icons',
    links: [
      { text: 'Unsubscribe', url: '{{unsubscribe_link}}' },
      { text: 'Contact Us', url: 'https://yourstore.com/contact' },
      { text: 'Privacy Policy', url: 'https://yourstore.com/privacy' }
    ]
  },
  
  navigation: {
    id: 'navigation',
    name: 'Category Blocks',
    description: 'Navigation grid with category buttons',
    links: [
      { text: 'New Arrivals', url: 'https://yourstore.com/new' },
      { text: 'Best Sellers', url: 'https://yourstore.com/bestsellers' },
      { text: 'Sale', url: 'https://yourstore.com/sale' },
      { text: 'All Products', url: 'https://yourstore.com/products' }
    ]
  },
  
  social: {
    id: 'social',
    name: 'Social & Engagement',
    description: 'Full-width links with social icons',
    links: [
      { text: 'Join Our Community', url: 'https://yourstore.com/community' },
      { text: 'Refer A Friend', url: 'https://yourstore.com/refer' },
      { text: 'Exclusive Offers', url: 'https://yourstore.com/offers' },
      { text: 'Instagram', url: 'https://instagram.com/yourstore' },
      { text: 'Facebook', url: 'https://facebook.com/yourstore' },
      { text: 'Unsubscribe', url: '{{unsubscribe_link}}' }
    ]
  }
};

/**
 * Generate MJML for Minimal footer
 */
export function generateMinimalFooter(brandProfile: any, links: any[]): string {
  const primaryColor = brandProfile.color_palette?.primary || '#000000';
  
  return `
    <mj-section background-color="${primaryColor}" padding="40px 20px">
      <mj-column>
        <!-- Links -->
        <mj-text align="center" color="#FFFFFF" font-size="12px" line-height="1.8">
          ${links.map(link => `<a href="${link.url}" style="color: #FFFFFF; text-decoration: none;">${link.text}</a>`).join(' | ')}
        </mj-text>
        
        <!-- Copyright -->
        <mj-text align="center" color="#CCCCCC" font-size="11px" padding-top="20px">
          © ${new Date().getFullYear()} ${brandProfile.brand_name || 'Company'}. All rights reserved.<br/>
          You're receiving this email because you subscribed to our newsletter.
        </mj-text>
      </mj-column>
    </mj-section>
  `;
}

/**
 * Generate MJML for Navigation Grid footer
 */
export function generateNavigationFooter(brandProfile: any, links: any[]): string {
  const primaryColor = brandProfile.color_palette?.primary || '#000000';
  const bgColor = brandProfile.color_palette?.background || '#F7F7F7';
  
  // Split links into pairs for 2-column grid
  const linkPairs = [];
  for (let i = 0; i < links.length; i += 2) {
    linkPairs.push(links.slice(i, i + 2));
  }
  
  return `
    <mj-section background-color="${bgColor}" padding="30px 20px">
      <mj-column>
        <mj-text align="center" font-size="18px" font-weight="bold" padding-bottom="20px">
          Shop by Category
        </mj-text>
      </mj-column>
    </mj-section>
    
    ${linkPairs.map(pair => `
    <mj-section background-color="${bgColor}" padding="5px 20px">
      ${pair.map(link => `
      <mj-column width="50%">
        <mj-button 
          href="${link.url}"
          background-color="transparent"
          color="${primaryColor}"
          border="2px solid ${primaryColor}"
          font-size="14px"
          font-weight="bold"
          padding="12px"
          inner-padding="12px 24px"
        >
          ${link.text.toUpperCase()}
        </mj-button>
      </mj-column>
      `).join('')}
    </mj-section>
    `).join('')}
    
    <mj-section background-color="${primaryColor}" padding="30px 20px">
      <mj-column>
        <mj-text align="center" color="#FFFFFF" font-size="16px" font-weight="bold">
          ${brandProfile.brand_name || 'Company'}
        </mj-text>
        <mj-text align="center" color="#CCCCCC" font-size="11px" padding-top="10px">
          © ${new Date().getFullYear()} All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  `;
}

/**
 * Generate MJML for Social/Engagement footer
 */
export function generateSocialFooter(brandProfile: any, links: any[]): string {
  const primaryColor = brandProfile.color_palette?.primary || '#000000';
  const accentColor = brandProfile.color_palette?.accent || '#0066CC';
  
  // Separate social links from regular links
  const socialLinks = links.filter(l => 
    l.text.toLowerCase().includes('instagram') ||
    l.text.toLowerCase().includes('facebook') ||
    l.text.toLowerCase().includes('twitter') ||
    l.text.toLowerCase().includes('tiktok')
  );
  
  const regularLinks = links.filter(l => !socialLinks.includes(l));
  
  return `
    <mj-section background-color="#FFFFFF" padding="20px">
      <mj-column>
        ${regularLinks.map(link => `
        <mj-text align="center" padding="10px">
          <a href="${link.url}" style="color: ${accentColor}; text-decoration: none; font-size: 16px; font-weight: 500;">
            ${link.text} →
          </a>
        </mj-text>
        <mj-divider border-width="1px" border-color="#E5E5E5" padding="5px 60px" />
        `).join('')}
      </mj-column>
    </mj-section>
    
    ${socialLinks.length > 0 ? `
    <mj-section background-color="#F7F7F7" padding="30px 20px">
      <mj-column>
        <mj-text align="center" color="#666666" font-size="14px" padding-bottom="15px">
          Follow Us
        </mj-text>
        <mj-social font-size="15px" icon-size="32px" mode="horizontal">
          ${socialLinks.map(link => {
            const platform = link.text.toLowerCase();
            return `<mj-social-element name="${platform}" href="${link.url}"></mj-social-element>`;
          }).join('')}
        </mj-social>
      </mj-column>
    </mj-section>
    ` : ''}
    
    <mj-section background-color="${primaryColor}" padding="30px 20px">
      <mj-column>
        ${brandProfile.logo_urls?.footer ? `
        <mj-image 
          src="${brandProfile.logo_urls.footer}" 
          width="150px" 
          padding-bottom="15px"
        />
        ` : `
        <mj-text align="center" color="#FFFFFF" font-size="20px" font-weight="bold" padding-bottom="10px">
          ${brandProfile.brand_name || 'Company'}
        </mj-text>
        `}
        
        <mj-text align="center" color="#CCCCCC" font-size="11px">
          © ${new Date().getFullYear()} ${brandProfile.brand_name || 'Company'}. All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  `;
}

/**
 * Get footer MJML based on template choice
 */
export function getFooterMJML(
  templateId: string,
  brandProfile: any,
  links: any[]
): string {
  switch (templateId) {
    case 'minimal':
      return generateMinimalFooter(brandProfile, links);
    case 'navigation':
      return generateNavigationFooter(brandProfile, links);
    case 'social':
      return generateSocialFooter(brandProfile, links);
    default:
      return generateMinimalFooter(brandProfile, links);
  }
}

