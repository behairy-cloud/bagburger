import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { loadStaff } from '../js/staff-store';
import { resolveMenuImageSource } from '../js/menu-images';

export default function StaffSection() {
  const prefersReduced = useReducedMotion();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    (async () => {
      const data = await loadStaff();
      setMembers((data || []).filter((m) => m.isVisible));
      setLoading(false);
    })();
  }, []);

  if (loading) return null;
  if (members.length === 0) return null;

  return (
    <section id="staff" className="staff-section">
      <div className="wrap staff-inner">
        <motion.span
          className="staff-kicker"
          initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          فريقنا
        </motion.span>
        <motion.h2
          className="staff-title"
          initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          الوجوه اللي ورا البرجر
        </motion.h2>

        <div className="staff-grid">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              className="staff-card"
              initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.36, delay: prefersReduced ? 0 : index * 0.06 }}
            >
              <div className="staff-card-image">
                {member.imagePath ? (
                  <img src={resolveMenuImageSource(member.imagePath)} alt={member.name} />
                ) : (
                  <div className="staff-card-placeholder">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="staff-card-info">
                <strong className="staff-card-name">{member.name}</strong>
                {member.role && <span className="staff-card-role">{member.role}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
