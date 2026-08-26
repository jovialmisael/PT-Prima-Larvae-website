import { useLoginController } from './useLoginController';
import { LoginFormCard } from './LoginFormCard';
import { LoginHeroCarousel } from './LoginHeroCarousel';
import { LoginHelpdeskModal } from './LoginHelpdeskModal';
import './Login.css';

export function Login() {
  const {
    username,
    setUsername,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    showPassword,
    toggleShowPassword,
    errorMsg,
    isLoading,
    showHelpdeskModal,
    toggleHelpdeskModal,
    handleLoginSubmit,
    applyDemoRole,
    demoRolePresets,
    activeSlide,
    activeSlideIndex,
    slides,
    nextSlide,
    prevSlide,
    goToSlide,
    setIsAutoPlayPaused,
  } = useLoginController();

  return (
    <div className="login-page">
      <div className="login-container-card">
        <LoginFormCard
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
          showPassword={showPassword}
          toggleShowPassword={toggleShowPassword}
          errorMsg={errorMsg}
          isLoading={isLoading}
          onOpenHelpdesk={() => toggleHelpdeskModal(true)}
          onSubmit={handleLoginSubmit}
          presets={demoRolePresets}
          onSelectRole={applyDemoRole}
        />

        <LoginHeroCarousel
          slides={slides}
          activeSlideIndex={activeSlideIndex}
          activeSlide={activeSlide}
          onNext={nextSlide}
          onPrev={prevSlide}
          onGoTo={goToSlide}
          onMouseEnter={() => setIsAutoPlayPaused(true)}
          onMouseLeave={() => setIsAutoPlayPaused(false)}
        />
      </div>

      <LoginHelpdeskModal
        isOpen={showHelpdeskModal}
        onClose={() => toggleHelpdeskModal(false)}
      />
    </div>
  );
}
