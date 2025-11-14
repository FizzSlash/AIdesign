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
 * Generate MJML for Navigation Grid footer (Like NY & Company)
 */
export function generateNavigationFooter(brandProfile: any, links: any[]): string {
  const primaryColor = brandProfile.color_palette?.primary || '#000000';
  const bgColor = brandProfile.color_palette?.background || '#F8F8F8';
  
  // Split into 2x2 grid
  const rows = [];
  for (let i = 0; i < links.length; i += 2) {
    rows.push(links.slice(i, i + 2));
  }
  
  return `
    <!-- Category Navigation Grid -->
    <mj-section background-color="#FFFFFF" padding="0">
      <mj-column>
        ${rows.map(row => `
        <mj-table>
          <tr>
            ${row.map(link => `
            <td style="width: 50%; padding: 2px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: ${bgColor}; padding: 8%; text-align: center; font-weight: 450; font-size: 17px;">
                    <a href="${link.url}" style="color: ${primaryColor}; text-decoration: none; display: block;">
                      <strong>${link.text.toUpperCase()}</strong>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
            `).join('')}
          </tr>
        </mj-table>
        `).join('')}
      </mj-column>
    </mj-section>
    
    <!-- Company Info -->
    <mj-section background-color="#FFFFFF" padding="30px 18px 9px">
      <mj-column>
        ${brandProfile.logo_urls?.footer ? `
        <mj-image 
          src="${brandProfile.logo_urls.footer}" 
          width="120px" 
          padding-bottom="15px"
        />
        ` : ''}
        
        <mj-text align="center" font-size="12px" line-height="1.8" color="#666666">
          <a href="#" style="color: ${primaryColor}; text-decoration: none;">Unsubscribe</a> | 
          <a href="#" style="color: ${primaryColor}; text-decoration: none;">Privacy</a>
        </mj-text>
        
        <mj-text align="center" font-size="11px" padding-top="10px" color="#999999">
          ${brandProfile.brand_name || 'Company'}<br/>
          © ${new Date().getFullYear()} All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  `;
}

/**
 * Generate MJML for Social/Engagement footer (Like Caraway)
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
    <!-- Full-width Link Blocks -->
    <mj-section background-color="#FFFFFF" padding="20px">
      <mj-column>
        ${regularLinks.map((link, index) => `
        <mj-text align="center" padding="${index === 0 ? '15px' : '12px'}">
          <a href="${link.url}" style="color: ${accentColor}; text-decoration: none; font-size: 16px; font-weight: 500; display: block;">
            ${link.text} →
          </a>
        </mj-text>
        ${index < regularLinks.length - 1 ? `
        <mj-divider border-width="1px" border-color="#E5E5E5" padding="0 40px" />
        ` : ''}
        `).join('')}
      </mj-column>
    </mj-section>
    
    ${socialLinks.length > 0 ? `
    <!-- Social Icons -->
    <mj-section background-color="#F7F7F7" padding="30px 20px">
      <mj-column>
        <mj-text align="center" color="#666666" font-size="14px" padding-bottom="15px">
          Follow Us
        </mj-text>
        <mj-social font-size="15px" icon-size="40px" mode="horizontal" padding="10px">
          ${socialLinks.map(link => {
            const platform = link.text.toLowerCase().replace(/\s+/g, '');
            const iconMap: any = {
              'instagram': 'instagram',
              'facebook': 'facebook', 
              'twitter': 'twitter',
              'tiktok': 'twitter', // MJML doesn't have TikTok, use Twitter as placeholder
              'youtube': 'youtube',
              'pinterest': 'pinterest'
            };
            return `<mj-social-element name="${iconMap[platform] || 'web'}" href="${link.url}"></mj-social-element>`;
          }).join('')}
        </mj-social>
      </mj-column>
    </mj-section>
    ` : ''}
    
    <!-- Company Footer -->
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
        
        <mj-text align="center" color="#CCCCCC" font-size="11px" line-height="1.6">
          ${brandProfile.brand_name || 'Company'}<br/>
          123 Main Street, City, State 12345<br/>
          © ${new Date().getFullYear()} All rights reserved.
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

