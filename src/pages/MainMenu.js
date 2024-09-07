import { NavLink } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Mousewheel, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import '../renderer/App.css';
import data from '../data.json';

import image1 from '../TSM-img/1.jpeg';
import image2 from '../TSM-img/2.jpeg';
import image3 from '../TSM-img/3.jpeg';
import image4 from '../TSM-img/4.jpeg';
import image5 from '../TSM-img/5.jpeg';
import { useDispatch, useSelector } from 'react-redux';
import { setContinue } from '../redux/CarouselSelectedItemSlice';

SwiperCore.use([Mousewheel, Pagination, Autoplay]);

export default function MainMenu() {
  const buttonArray = data.buttonArray;
  const reportData = useSelector((state) => state.selectedItem)
  const [once,setOnce] = useState(true)
  console.log(reportData);
  const dispatch = useDispatch()
  useEffect(() => {
    if (once) {
      setOnce(false)
      dispatch(setContinue(true));
    } 
  }, []);
  const swiperRef = useRef(null);

  useEffect(() => {
    const swiperInstance = swiperRef.current.swiper;

    if (swiperInstance) {
      const scaleSlides = () => {
        swiperInstance.slides.forEach((slide, index) => {
          let scale = 1 - Math.abs(index - swiperInstance.activeIndex) * 0.1;
          scale = Math.max(scale, 0.72);
          slide.style.transform = `scale(${scale})`;
        });
      };

      scaleSlides();
      swiperInstance.on('slideChange', scaleSlides);
    }
  }, []);

  return (
    <div className="mainMenu_main_class">
      <Swiper
        ref={swiperRef}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 3000 }}  // Adjust delay as needed
        className="backgroundSwiper"
      >
        <SwiperSlide style={{ backgroundImage: `url(${image1})` }}>
          <div className="overlay"></div>
        </SwiperSlide>
        <SwiperSlide style={{ backgroundImage: `url(${image2})` }}>
          <div className="overlay"></div>
        </SwiperSlide>
        <SwiperSlide style={{ backgroundImage: `url(${image3})` }}>
          <div className="overlay"></div>
        </SwiperSlide>
        <SwiperSlide style={{ backgroundImage: `url(${image4})` }}>
          <div className="overlay"></div>
        </SwiperSlide>
        <SwiperSlide style={{ backgroundImage: `url(${image5})` }}>
          <div className="overlay"></div>
        </SwiperSlide>
      </Swiper>

      <div className="main_content">
        <div className="content_first_half">
          <div className="content_first_half_main_heading">
            <p>Good afternoon.</p>
            <span>TSM II</span>
            <span>SIMULATOR</span>
          </div>
        </div>
        <div className="content_second_half">
          <NavLink to="/">Home</NavLink>
          <div className="button_slider">
            <Swiper
              ref={swiperRef}
              slidesPerView={7}
              direction="vertical"
              centeredSlides={true}
              loop={true}
              mousewheel={true}
              pagination={{ clickable: true }}
              className="mySwiper"
            >
              {buttonArray.map((data, index) => (
                <SwiperSlide key={index} className="swiper_slide">
                  <NavLink to={data.link} className="button_slider_button">
                    <span>{data.name}</span>
                  </NavLink>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
}
