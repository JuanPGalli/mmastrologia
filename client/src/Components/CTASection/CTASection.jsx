const CTASection = ({
  title,
  description,
  primaryText,
  primaryLink,
  secondaryText,
  secondaryLink,
}) => {
  return (
    <section className='bg-[#f7f3fb] py-20 mt-24'>
      <div className='max-w-4xl mx-auto text-center px-6'>
        <h2 className='text-3xl md:text-4xl font-light text-purple-900'>{title}</h2>

        <p className='mt-6 text-lg text-purple-700'>{description}</p>

        <div className='mt-10 flex flex-col items-center gap-4'>
          {/* CTA principal */}
          <a
            href={primaryLink}
            className='bg-purple-800 text-white px-8 py-4 rounded-full text-lg hover:bg-purple-900 transition shadow-lg hover:shadow-xl'
          >
            {primaryText}
          </a>

          {/* CTA secundario */}
          {secondaryText && (
            <a
              href={secondaryLink}
              className='text-purple-600 underline underline-offset-4 hover:text-purple-800 transition'
            >
              {secondaryText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default CTASection;
