import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Badge,
  Tooltip,
  Fab,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Favorite,
  Share,
  Comment,
  ThumbUp,
  Visibility,
  Notifications,
  Menu,
  ExpandMore,
  ExpandLess,
  ArrowUpward,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import { motion, AnimatePresence, useAnimation, useInView, useScroll, useTransform } from 'framer-motion';

// Animated Button Component
export const AnimatedButton = ({ 
  children, 
  variant = 'contained', 
  onClick, 
  startIcon,
  animationType = 'scale',
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();

  const getAnimationProps = () => {
    switch (animationType) {
      case 'scale':
        return {
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 },
          transition: { type: 'spring', stiffness: 300, damping: 20 },
        };
      case 'slide':
        return {
          whileHover: { x: 5 },
          whileTap: { x: -5 },
          transition: { type: 'spring', stiffness: 300, damping: 20 },
        };
      case 'rotate':
        return {
          whileHover: { rotate: 5 },
          whileTap: { rotate: -5 },
          transition: { type: 'spring', stiffness: 300, damping: 20 },
        };
      default:
        return {
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 },
        };
    }
  };

  return (
    <motion.div {...getAnimationProps()}>
      <Button
        variant={variant}
        onClick={onClick}
        startIcon={startIcon}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: isHovered 
              ? `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`
              : 'transparent',
            transition: 'all 0.3s ease',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          },
          ...props.sx,
        }}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};

// Animated Card Component
export const AnimatedCard = ({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  hoverEffect = true,
  ...props 
}) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      whileHover={hoverEffect ? { 
        y: -8, 
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        scale: 1.02 
      } : {}}
      style={{ cursor: hoverEffect ? 'pointer' : 'default' }}
    >
      <Card
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          borderRadius: 3,
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '2px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
          },
          '@keyframes shimmer': {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' },
          },
          ...props.sx,
        }}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
};

// Floating Action Button with Animation
export const AnimatedFab = ({ 
  icon, 
  onClick, 
  color = 'primary', 
  position = { bottom: 24, right: 24 },
  tooltip = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  return (
    <Box sx={{ position: 'fixed', ...position, zIndex: 1000 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Fab size="small" color="secondary">
                  <Edit />
                </Fab>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Fab size="small" color="secondary">
                  <Delete />
                </Fab>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Fab size="small" color="secondary">
                  <Share />
                </Fab>
              </motion.div>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Tooltip title={tooltip}>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Fab
            color={color}
            onClick={() => {
              onClick?.();
              setIsOpen(!isOpen);
            }}
            sx={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              '&:hover': {
                boxShadow: '0 6px 30px rgba(0,0,0,0.3)',
              },
            }}
          >
            {isOpen ? <Close /> : icon}
          </Fab>
        </motion.div>
      </Tooltip>
    </Box>
  );
};

// Animated Avatar Component
export const AnimatedAvatar = ({ 
  src, 
  alt, 
  children, 
  size = 40, 
  badge = false,
  badgeContent = 0,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <Badge
        badgeContent={badgeContent}
        color="error"
        invisible={!badge}
        overlap="circular"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Avatar
          src={src}
          alt={alt}
          sx={{
            width: size,
            height: size,
            border: isHovered ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
            transition: 'all 0.3s ease',
            boxShadow: isHovered ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
          }}
        >
          {children}
        </Avatar>
      </Badge>
    </motion.div>
  );
};

// Animated Chip Component
export const AnimatedChip = ({ 
  label, 
  color = 'primary', 
  onDelete, 
  clickable = false,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Chip
        label={label}
        color={color}
        onDelete={onDelete}
        clickable={clickable}
        onClick={onClick}
        sx={{
          borderRadius: 16,
          fontWeight: 500,
          cursor: clickable || onClick ? 'pointer' : 'default',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        }}
      />
    </motion.div>
  );
};

// Scroll to Top Button
export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((v) => setIsVisible(v > 0.3));
    return unsubscribe;
  }, [scrollYProgress]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Fab
            color="primary"
            onClick={scrollToTop}
            size="small"
            sx={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <ArrowUpward />
          </Fab>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Animated List Item
export const AnimatedListItem = ({ 
  children, 
  index, 
  delay = 0,
  onClick,
}) => {
  const controls = useAnimation();
  const isInView = useInView({ threshold: 0.1 });

  React.useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
      }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ x: 10 }}
      whileTap={{ scale: 0.98 }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// Pulse Animation Component
export const PulseAnimation = ({ children, pulseColor = 'primary' }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [1, 0.8, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.div>
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'inherit',
          border: `2px solid ${theme.palette[pulseColor].main}`,
        }}
      />
    </Box>
  );
};

// Loading Dots Animation
export const LoadingDots = ({ size = 8, color = 'primary' }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.2,
          }}
        >
          <Box
            sx={{
              width: size,
              height: size,
              borderRadius: '50%',
              bgcolor: theme.palette[color].main,
            }}
          />
        </motion.div>
      ))}
    </Box>
  );
};

// Shimmer Effect Component
export const ShimmerEffect = ({ height = 20, width = '100%', borderRadius = 4 }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        height,
        width,
        borderRadius,
        bgcolor: alpha(theme.palette.grey[300], 0.3),
      }}
    >
      <motion.div
        animate={{
          x: [-200, 200],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 200,
          height: '100%',
          background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.grey[100], 0.8)}, transparent)`,
        }}
      />
    </Box>
  );
};

// Hover Card with 3D Effect
export const HoverCard3D = ({ children, ...props }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      whileHover={{
        rotateX: mousePosition.y,
        rotateY: mousePosition.x,
        scale: 1.05,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
    >
      <Card
        sx={{
          transformStyle: 'preserve-3d',
          boxShadow: isHovered 
            ? '0 20px 40px rgba(0,0,0,0.3)' 
            : '0 4px 20px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          ...props.sx,
        }}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
};

// Notification Badge with Animation
export const AnimatedBadge = ({ children, badgeContent, color = 'error' }) => {
  const [animate, setAnimate] = useState(false);

  React.useEffect(() => {
    if (badgeContent > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [badgeContent]);

  return (
    <Badge
      badgeContent={badgeContent}
      color={color}
      overlap="circular"
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <motion.div
        animate={animate ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </Badge>
  );
};

// Export all components
export default {
  AnimatedButton,
  AnimatedCard,
  AnimatedFab,
  AnimatedAvatar,
  AnimatedChip,
  ScrollToTopButton,
  AnimatedListItem,
  PulseAnimation,
  LoadingDots,
  ShimmerEffect,
  HoverCard3D,
  AnimatedBadge,
};
